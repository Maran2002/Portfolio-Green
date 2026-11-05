
import {
  easeExpoOut,
  easeSmoothOut,
  easeInOut,
  springGentle,
  springSnappy,
  springBouncy,
} from "./motionConfig";

export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeExpoOut,
    },
  },
};

export const fadeUpFast = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeSmoothOut },
  },
};

export const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -24,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeExpoOut,
    },
  },
};

export const fadeRight = {
  hidden: {
    opacity: 0,
    x: 24,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeExpoOut,
    },
  },
};

export const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springGentle,
    },
  },
};

export const scaleInBounce = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springBouncy,
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const revealMask = {
  hidden: {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0,
  },
  show: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: {
      clipPath: { duration: 0.9, ease: easeExpoOut },
      opacity: { duration: 0.3 },
    },
  },
};

export const revealMaskUp = {
  hidden: {
    clipPath: "inset(100% 0 0 0)",
    opacity: 0,
  },
  show: {
    clipPath: "inset(0% 0 0 0)",
    opacity: 1,
    transition: {
      clipPath: { duration: 0.8, ease: easeExpoOut },
      opacity: { duration: 0.2 },
    },
  },
};

export const footerTextReveal = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  show: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: easeExpoOut,
    },
  },
};

export const footerTextContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const cardHover = {
  whileHover: {
    y: -5,
    scale: 1.01,
    transition: springGentle,
  },
  whileTap: {
    scale: 0.97,
    transition: springSnappy,
  },
};

export const cardHoverSubtle = {
  whileHover: {
    y: -3,
    transition: springSnappy,
  },
  whileTap: {
    scale: 0.97,
    transition: springSnappy,
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeSmoothOut },
  },
};

export const drawLine = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.2, ease: easeInOut },
      opacity: { duration: 0.2 },
    },
  },
};

export const stepPop = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: springBouncy,
  },
};

export const blurIn = {
  hidden: {
    opacity: 0,
    filter: "blur(8px)",
    scale: 0.97,
  },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easeExpoOut,
    },
  },
};
