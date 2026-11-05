import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { EASINGS, TIMINGS } from '../animations/motionTokens';

export const useAmbientFloat = (ref, options = {}) => {
  useGSAP(() => {
    if (!ref.current) return;

    const { 
      y = 20, 
      rotation = 5, 
      duration = TIMINGS.cinematic * 2,
      target = null
    } = options;

    const animationTarget = target ? gsap.utils.toArray(target, ref.current) : ref.current;

    gsap.to(animationTarget, {
      y,
      rotation,
      duration,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: {
        amount: duration / 2,
        from: "random"
      }
    });
  }, { scope: ref });
};
