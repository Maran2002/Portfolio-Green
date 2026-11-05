import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { EASINGS, TIMINGS } from '../animations/motionTokens';

gsap.registerPlugin(ScrollTrigger);

export const useSectionReveal = (ref, options = {}) => {
  useGSAP(() => {
    if (!ref.current) return;

    const isMobile = window.innerWidth < 768;

    const {
      y = isMobile ? 14 : 22,
      opacity = 0,
      duration = isMobile ? TIMINGS.fast : TIMINGS.normal,
      ease = EASINGS.premiumOut,
      delay = 0,
      stagger = 0,
      target = null,
      start = null,
    } = options;

    const elements = target
      ? gsap.utils.toArray(target, ref.current)
      : [ref.current];

    if (!elements || elements.length === 0) return;

    elements.forEach((el, i) => {
      gsap.set(el, { y, opacity });
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration,
        ease,
        delay: delay + i * stagger,
        scrollTrigger: {
          trigger: el,
          // Fire earlier on mobile so tall cards don't miss the trigger
          start: start || (isMobile ? "top 94%" : "top 88%"),
          // Don't reverse on mobile — scroll-up reversal is janky on touch
          toggleActions: isMobile
            ? "play none none none"
            : "play none none reverse",
        },
      });
    });
  }, { scope: ref });
};
