// src/components/CelebrationBurst.tsx
// One-shot emoji confetti burst — portal-based, self-cleaning

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CELEBRATION } from '@/config/celebration';

interface CelebrationBurstProps {
  origin: { x: number; y: number };
  onComplete: () => void;
}

export function CelebrationBurst({ origin, onComplete }: CelebrationBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
      onComplete();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const { emojis, particleCount, spreadRadius, duration, sizeMin, sizeMax } = CELEBRATION;

    // Create particles with random angles and distances
    const particles: HTMLSpanElement[] = [];
    for (let i = 0; i < particleCount; i++) {
      const span = document.createElement('span');
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.6;
      const distance = spreadRadius * (0.5 + Math.random() * 0.5);
      const size = sizeMin + Math.random() * (sizeMax - sizeMin);

      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.position = 'fixed';
      span.style.left = `${origin.x}px`;
      span.style.top = `${origin.y}px`;
      span.style.fontSize = `${size}px`;
      span.style.lineHeight = '1';
      span.style.pointerEvents = 'none';
      span.style.zIndex = '9999';
      span.style.willChange = 'transform, opacity';
      span.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration * 0.6}ms ease ${duration * 0.4}ms`;
      span.style.transform = 'translate(-50%, -50%) scale(0.3)';
      span.style.opacity = '1';

      container.appendChild(span);
      particles.push(span);

      // Store target position for this particle
      span.dataset.tx = String(Math.cos(angle) * distance);
      span.dataset.ty = String(Math.sin(angle) * distance);
    }

    // Trigger the transition on next frame
    requestAnimationFrame(() => {
      for (const span of particles) {
        const tx = Number(span.dataset.tx);
        const ty = Number(span.dataset.ty);
        span.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1) rotate(${(Math.random() - 0.5) * 180}deg)`;
        span.style.opacity = '0';
      }
    });

    // Self-clean after animation completes
    const timer = setTimeout(() => {
      onComplete();
    }, duration + 50);

    return () => clearTimeout(timer);
  }, [origin, onComplete]);

  return createPortal(
    <div ref={containerRef} aria-hidden="true" />,
    document.body
  );
}
