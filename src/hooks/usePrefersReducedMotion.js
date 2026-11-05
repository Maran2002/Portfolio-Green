/**
 * usePrefersReducedMotion.js
 * ─────────────────────────────────────────────────────────────────
 * Accessibility hook — detects the user's OS-level "reduce motion"
 * preference via the `prefers-reduced-motion` media query.
 *
 * WCAG 2.1 AA compliance requirement.
 * All animation-heavy components MUST use this hook and either:
 *   1. Skip complex animations entirely when true
 *   2. Replace with instant opacity transitions
 *
 * Usage:
 *   const prefersReducedMotion = usePrefersReducedMotion();
 *   const variants = prefersReducedMotion ? reducedVariant : fullVariant;
 *
 * Framer Motion also has its own internal check, but this hook
 * gives us explicit control per-component for fine-grained behavior.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";

/**
 * Returns true if the user's OS prefers reduced motion.
 * Reactively updates if the preference changes at runtime.
 */
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // SSR-safe initial value
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Use addEventListener for modern browsers (replaces deprecated addListener)
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

export default usePrefersReducedMotion;

/**
 * Utility: Returns a "safe" variant set — if reduced motion is preferred,
 * returns a simple fade-only variant, otherwise returns the full variant.
 *
 * Usage:
 *   const safeVariant = getMotionSafeVariant(prefersReducedMotion, fadeUpVariant);
 */
export const getMotionSafeVariant = (prefersReducedMotion, fullVariant) => {
  if (!prefersReducedMotion) return fullVariant;

  // Reduced: strip positional transforms, keep only opacity
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };
};

/**
 * Utility: Returns reduced or full transition config for spring animations.
 * Use when spreading transition directly (not using variants).
 *
 * Usage:
 *   transition={getMotionSafeTransition(prefersReducedMotion, springGentle)}
 */
export const getMotionSafeTransition = (prefersReducedMotion, fullTransition) => {
  if (!prefersReducedMotion) return fullTransition;
  return { duration: 0.01 }; // Near-instant
};
