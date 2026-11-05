import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useParallax = (ref, options = {}) => {
  useGSAP(() => {
    if (!ref.current) return;

    const mm = gsap.matchMedia();
    const { 
      speed = 1,
      yRange = [-50, 50],
      start = "top bottom",
      end = "bottom top"
    } = options;

    mm.add("(min-width: 768px)", () => {
      gsap.fromTo(ref.current, 
        { y: yRange[0] * speed },
        {
          y: yRange[1] * speed,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start,
            end,
            scrub: 1,
          }
        }
      );
    });

    return () => mm.revert();
  }, { scope: ref });
};
