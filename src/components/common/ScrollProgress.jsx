/**
 * ScrollProgress.jsx
 * ─────────────────────────────────────────────────────────────────
 * Premium thin scroll progress indicator — fixed at the very top
 * of the viewport, above the header.
 *
 * Uses Framer Motion's `useScroll` + `useSpring` for silky smooth
 * progress tracking with spring physics inertia.
 *
 * Features:
 * - Gradient bar: green-400 → emerald-500 → teal-400
 * - Spring physics for smooth lag-free tracking
 * - Glow effect on the leading edge
 * - Respects prefers-reduced-motion (disables spring, instant fill)
 * - z-index: 9999 — always above header (z-50)
 *
 * Usage in App.jsx:
 *   import ScrollProgress from "./components/common/ScrollProgress";
 *   // Place before <Header /> in the tree
 * ─────────────────────────────────────────────────────────────────
 */

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Spring smoothing — tight spring for responsive yet smooth feel
  // If reduced motion: no spring, direct binding
  const scaleX = useSpring(scrollYProgress, {
    stiffness: prefersReducedMotion ? 1000 : 180,
    damping: prefersReducedMotion ? 100 : 28,
    restDelta: 0.001,
  });

  return (
    <>
      {/* Track — background line */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] bg-white/5 z-[9999] pointer-events-none"
        aria-hidden="true"
      />

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left pointer-events-none"
        style={{
          scaleX,
          background:
            "linear-gradient(90deg, #4ade80 0%, #10b981 50%, #2dd4bf 100%)",
        }}
        aria-hidden="true"
      >
        {/* Leading edge glow dot */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_3px_rgba(52,211,153,0.8)] -translate-x-0"
          aria-hidden="true"
        />
      </motion.div>
    </>
  );
};

export default ScrollProgress;
