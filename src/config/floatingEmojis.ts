// Floating emoji configuration — tweak these values to taste

export const FLOATING_EMOJIS = {
  /** Number of emojis on desktop (>= 768px) */
  countDesktop: 25,
  /** Number of emojis on mobile (< 768px) */
  countMobile: 12,

  /** Opacity range: min (larger emojis) to max (smaller emojis) */
  opacityMin: 0.7,
  opacityMax: 1.0,

  /** Emoji font size range in px (center-weighted distribution) */
  sizeMin: 24,
  sizeMax: 40,

  /** Drift speed range in px/s */
  speedMin: 20,
  speedMax: 40,
};
