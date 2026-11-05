export const EASINGS = {
  premiumOut: "expo.out",
  premiumInOut: "power4.inOut",
  smooth: "power2.out",
  bounce: "back.out(1.7)",
  gentle: "sine.out",
  anticipate: "back.in(1.7)"
};

export const TIMINGS = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.0,
  cinematic: 1.6,
};

export const STAGGERS = {
  fast: 0.04,
  normal: 0.08,
  slow: 0.14,
};

// Scaled-down parallax — larger values cause motion sickness on mobile
export const PARALLAX = {
  subtle: 30,
  medium: 80,
  dramatic: 150,
};

// Use these when animating inside mobile breakpoints
export const PARALLAX_MOBILE = {
  subtle: 12,
  medium: 30,
  dramatic: 60,
};
