// ─── SPRING PRESETS ──────────────────────────────────────────────

/** Snappy, tight spring — micro-interactions, buttons */
export const springSnappy = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.8,
};

/** Smooth, cinematic spring — hero reveals, section entrances */
export const springCinematic = {
  type: "spring",
  stiffness: 80,
  damping: 20,
  mass: 1.2,
};

/** Gentle, floating spring — cards, image reveals */
export const springGentle = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 1,
};

/** Bouncy spring — badges, icons, skill chips */
export const springBouncy = {
  type: "spring",
  stiffness: 400,
  damping: 15,
  mass: 0.6,
};

/** Stiff spring — near-instant, nav active indicator */
export const springStiff = {
  type: "spring",
  stiffness: 700,
  damping: 35,
  mass: 0.5,
};

// ─── EASE PRESETS ────────────────────────────────────────────────

/** Expo out — dramatic deceleration, large reveals */
export const easeExpoOut = [0.16, 1, 0.3, 1];

/** Smooth out — natural feel for text and card reveals */
export const easeSmoothOut = [0.25, 0.46, 0.45, 0.94];

/** Anticipate in — slight pull-back before motion */
export const easeAnticipate = [0.36, 0, 0.66, -0.56];

/** Overshoot out — gentle bounce end, image scale */
export const easeOvershoot = [0.34, 1.56, 0.64, 1];

/** In-out — symmetric, looping or bidirectional motion */
export const easeInOut = [0.76, 0, 0.24, 1];

// ─── STAGGER PRESETS ─────────────────────────────────────────────

/** Fast stagger — skills grid, filter tabs */
export const staggerFast = {
  staggerChildren: 0.05,
  delayChildren: 0.08,
};

/** Normal stagger — services cards, workflow steps */
export const staggerNormal = {
  staggerChildren: 0.08,
  delayChildren: 0.1,
};

/** Slow stagger — cinematic, hero sequences */
export const staggerSlow = {
  staggerChildren: 0.1,
  delayChildren: 0.15,
};

/** Hero stagger — h1/h2/p/cta sequence */
export const staggerHero = {
  staggerChildren: 0.1,
  delayChildren: 0.05,
};

// ─── VIEWPORT PRESETS ────────────────────────────────────────────
// Lower thresholds fire animations sooner — important on mobile
// where tall cards may never reach 30% visibility.

/** Once — triggers once, fires at 10% visibility */
export const viewportOnce = {
  once: true,
  amount: 0.1,
};

/** Once mid — for full-width blocks, fires at 15% */
export const viewportOnceMid = {
  once: true,
  amount: 0.15,
};

/** Repeat — re-triggers every time (use sparingly) */
export const viewportRepeat = {
  once: false,
  amount: 0.1,
};

// ─── HOVER LIFT PRESETS ──────────────────────────────────────────
// Smaller y values prevent "stuck hover" feel on touch devices.

/** Subtle lift — cards, project tiles */
export const hoverLiftSubtle = {
  whileHover: {
    y: -4,
    transition: springGentle,
  },
  whileTap: {
    scale: 0.97,
    transition: springSnappy,
  },
};

/** Strong lift — CTA buttons, featured cards */
export const hoverLiftStrong = {
  whileHover: {
    y: -6,
    scale: 1.01,
    transition: springGentle,
  },
  whileTap: {
    scale: 0.96,
    transition: springSnappy,
  },
};

/** Glow lift — skill chips, icon cards */
export const hoverGlowLift = {
  whileHover: {
    y: -3,
    scale: 1.03,
    transition: springSnappy,
  },
  whileTap: {
    scale: 0.95,
    transition: springSnappy,
  },
};

// ─── BUTTON / TAP PRESETS ────────────────────────────────────────

/** Primary button interaction */
export const tapPrimary = {
  whileHover: { scale: 1.04, transition: springSnappy },
  whileTap: { scale: 0.95, transition: springSnappy },
};

/** Icon button interaction */
export const tapIcon = {
  whileHover: { scale: 1.12, rotate: 4, transition: springBouncy },
  whileTap: { scale: 0.88, transition: springSnappy },
};

/** Nav link interaction */
export const tapNav = {
  whileHover: { y: -1, transition: springSnappy },
  whileTap: { scale: 0.97, transition: springSnappy },
};

// ─── PAGE TRANSITION PRESETS ─────────────────────────────────────

/** Fade — clean and safe, primary route transition */
export const pageTransitionFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: easeSmoothOut } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: easeInOut } },
};

/** Slide-up — cinematic, fresh pages */
export const pageTransitionSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeExpoOut },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: easeInOut },
  },
};

// ─── DURATION SHORTHANDS ─────────────────────────────────────────

export const duration = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  cinematic: 0.9,
};
