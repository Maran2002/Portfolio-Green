import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { springBouncy, springSnappy, tapPrimary, hoverLiftStrong } from "../utils/motionConfig";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: springBouncy }}
          exit={{ opacity: 0, scale: 0, y: 20, transition: springSnappy }}
          {...hoverLiftStrong}
          whileTap={tapPrimary.whileTap}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-green-600 text-white rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] z-50 hover:bg-green-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-colors focus:outline-none flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
