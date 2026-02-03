// src/components/FloatingEmojis.tsx

import { useEffect, useRef } from 'react';
import { FLOATING_EMOJIS } from '@/config/floatingEmojis';

// Physics constants
const REPULSION_RADIUS = 130;
const REPULSION_DEAD_ZONE = 30;
const REPULSION_STRENGTH = 800000;
const REPULSION_MAX_FORCE = 80;
const MAX_SPEED = 80;
const DAMPING_PER_SECOND = Math.pow(0.96, 60); // ~0.085

interface Emoji {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phaseX: number;
  phaseY: number;
  freqX: number;
  freqY: number;
  wobblePhase: number;
  baseSpeed: number;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/** Center-weighted random: biased toward middle of range via averaging two uniform samples */
function randomCenterWeighted(min: number, max: number) {
  return (randomBetween(min, max) + randomBetween(min, max)) / 2;
}

function createEmoji(width: number, height: number): Emoji {
  const { sizeMin, sizeMax, opacityMin, opacityMax, speedMin, speedMax } = FLOATING_EMOJIS;
  const size = randomCenterWeighted(sizeMin, sizeMax);
  // Larger emojis get lower opacity for depth illusion
  const sizeRange = sizeMax - sizeMin || 1;
  const opacityRange = opacityMax - opacityMin;
  const opacityBase = opacityMax - ((size - sizeMin) / sizeRange) * opacityRange;
  const opacity = Math.max(opacityMin, Math.min(opacityMax, opacityBase + randomBetween(-0.05, 0.05)));
  const baseSpeed = randomBetween(speedMin, speedMax);
  const angle = Math.random() * Math.PI * 2;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * baseSpeed,
    vy: Math.sin(angle) * baseSpeed,
    size,
    opacity,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    // Slightly randomized frequencies per emoji to avoid synchronization
    freqX: 0.001 + randomBetween(-0.0002, 0.0002),
    freqY: 0.0008 + randomBetween(-0.0002, 0.0002),
    wobblePhase: Math.random() * Math.PI * 2,
    baseSpeed,
  };
}

export function FloatingEmojis() {
  const containerRef = useRef<HTMLDivElement>(null);
  const emojisRef = useRef<Emoji[]>([]);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const countRef = useRef<number>(0);
  const entranceRef = useRef<number>(0);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function getCount() {
      return isMobile.matches ? FLOATING_EMOJIS.countMobile : FLOATING_EMOJIS.countDesktop;
    }

    function getViewport() {
      return {
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
      };
    }

    function initEmojis() {
      const { w, h } = getViewport();
      const count = getCount();
      countRef.current = count;
      emojisRef.current = Array.from({ length: count }, () => createEmoji(w, h));
      entranceRef.current = 0;
    }

    initEmojis();

    function handleMediaChange() {
      const newCount = getCount();
      if (newCount !== countRef.current) {
        const { w, h } = getViewport();
        countRef.current = newCount;
        emojisRef.current = Array.from({ length: newCount }, () => createEmoji(w, h));
        entranceRef.current = 0;
        renderSpans();
      }
    }

    function renderSpans() {
      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = '';
      spanRefs.current = [];

      emojisRef.current.forEach((emoji, i) => {
        const span = document.createElement('span');
        span.textContent = '🍝';
        span.style.position = 'absolute';
        span.style.fontSize = `${emoji.size}px`;
        span.style.lineHeight = '1';
        span.style.pointerEvents = 'none';
        span.style.willChange = 'transform, opacity';
        span.style.opacity = '0';
        span.style.transform = `translate3d(${emoji.x}px, ${emoji.y}px, 0)`;
        container.appendChild(span);
        spanRefs.current[i] = span;
      });
    }

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    let paused = false;
    function handleVisibility() {
      if (document.hidden) {
        paused = true;
      } else {
        paused = false;
        lastTimeRef.current = performance.now();
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }
    }

    function tick(now: number) {
      if (paused || reducedMotion.matches) {
        rafRef.current = 0;
        return;
      }

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const { w, h } = getViewport();
      const mouse = mouseRef.current;
      const emojis = emojisRef.current;

      entranceRef.current += dt;

      for (let i = 0; i < emojis.length; i++) {
        const e = emojis[i];
        const span = spanRefs.current[i];
        if (!span) continue;

        // Stagger entrance: each emoji fades in 150ms apart over 500ms
        const entranceDelay = i * 0.15;
        const entranceProgress = Math.min(1, Math.max(0, (entranceRef.current - entranceDelay) / 0.5));
        if (entranceProgress <= 0) {
          span.style.opacity = '0';
          continue;
        }

        // Sinusoidal drift modulation — applied directly to position for visible wandering
        // Amplitude of 12 px/s gives perceptible organic drift on top of base velocity
        const sinX = Math.sin(now * e.freqX + e.phaseX) * 12;
        const sinY = Math.sin(now * e.freqY + e.phaseY) * 12;

        // Mouse repulsion (inverse-square with dead zone)
        const dx = e.x - mouse.x;
        const dy = e.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < REPULSION_RADIUS && dist > 0) {
          const normalDist = Math.max(dist, REPULSION_DEAD_ZONE);
          const force = Math.min(REPULSION_STRENGTH / (normalDist * normalDist), REPULSION_MAX_FORCE);
          const nx = dx / dist;
          const ny = dy / dist;
          e.vx += nx * force * dt;
          e.vy += ny * force * dt;
        }

        // Smooth damping: blend factor based on how far above baseSpeed we are
        // No hard threshold — damping increases gradually as speed exceeds base
        const speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
        if (speed > e.baseSpeed) {
          const excessRatio = Math.min((speed - e.baseSpeed) / e.baseSpeed, 1);
          // Lerp between 1.0 (no damping) and full damping based on excess
          const dampFactor = Math.pow(DAMPING_PER_SECOND, dt * excessRatio);
          e.vx *= dampFactor;
          e.vy *= dampFactor;
        }

        // Cap max velocity
        const currentSpeed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
        if (currentSpeed > MAX_SPEED) {
          const scale = MAX_SPEED / currentSpeed;
          e.vx *= scale;
          e.vy *= scale;
        }

        // Update position (sin modulation added directly for visible wandering)
        e.x += (e.vx + sinX) * dt;
        e.y += (e.vy + sinY) * dt;

        // Edge wrapping — fully off-screen before appearing on opposite side
        if (e.x < -e.size) e.x = w + e.size;
        else if (e.x > w + e.size) e.x = -e.size;
        if (e.y < -e.size) e.y = h + e.size;
        else if (e.y > h + e.size) e.y = -e.size;

        // Wobble rotation
        const wobble = Math.sin(now * 0.0008 + e.wobblePhase) * 15;

        // Apply to DOM
        span.style.transform = `translate3d(${e.x}px, ${e.y}px, 0) rotate(${wobble}deg)`;
        span.style.opacity = String(e.opacity * entranceProgress);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    renderSpans();

    if (!reducedMotion.matches) {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibility);
    isMobile.addEventListener('change', handleMediaChange);

    function handleReducedMotionChange() {
      if (reducedMotion.matches) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
        spanRefs.current.forEach((span) => {
          if (span) span.style.opacity = '0';
        });
      } else {
        lastTimeRef.current = performance.now();
        entranceRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    reducedMotion.addEventListener('change', handleReducedMotionChange);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      isMobile.removeEventListener('change', handleMediaChange);
      reducedMotion.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
    />
  );
}
