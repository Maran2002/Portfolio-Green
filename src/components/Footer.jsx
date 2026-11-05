import React from "react";
import { Mail, Phone, Linkedin, Github, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { 
  staggerContainerSlow, 
  footerTextContainer,
  footerTextReveal,
  fadeUp
} from "../utils/motionVariants";
import { 
  springCinematic, 
  viewportOnce,
  tapPrimary
} from "../utils/motionConfig";

import { CONTACT_INFO, USER_INFO } from "../utils/apiConfig";

const Footer = () => {
  return (
    <footer className="bg-dark-bg pt-20 border-t border-gray-800 overflow-hidden relative">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Massive Typography Section */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={footerTextContainer}
          className="text-center mb-16 relative py-12"
        >
          <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black text-white leading-none tracking-tighter uppercase mb-4 flex flex-col overflow-hidden">
            <motion.span variants={footerTextReveal}>Let's Grow</motion.span>
            <motion.span variants={footerTextReveal}>Together</motion.span>
          </h2>
          
          {/* Spinning floating button/badge - Framer Motion Powered */}
          <motion.div 
            variants={fadeUp}
            whileHover={{ scale: 1.1 }}
            transition={springCinematic}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-black font-black text-xs md:text-sm text-center border-4 border-dark-bg cursor-pointer z-10 shadow-[0_0_25px_rgba(34,197,94,0.3)]"
          >
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute w-full h-full flex items-center justify-center"
             >
                 <svg viewBox="0 0 100 100" className="w-[120%] h-[120%]">
                    <path id="curve" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                    <text className="text-[13.5px] font-black uppercase tracking-widest" fill="black">
                      <textPath href="#curve" startOffset="0%">
                        • FULLSTACK • JAVASCRIPT 
                      </textPath>
                    </text>
                 </svg>
             </motion.div>
             <div className="absolute inset-0 flex items-center justify-center">
               <Sparkles size={28} className="text-black fill-black" />
             </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainerSlow}
        >
          {/* Contact Links Array */}
          <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-gray-800 gap-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-center md:text-left">
              <motion.a variants={fadeUp} {...tapPrimary} href={`mailto:${CONTACT_INFO.email}`} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-lg font-medium">
                <Mail className="w-5 h-5" /> {CONTACT_INFO.email}
              </motion.a>
               <motion.a variants={fadeUp} {...tapPrimary} href={`tel:${CONTACT_INFO.phoneRaw}`} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-lg font-medium">
                <Phone className="w-5 h-5" /> {CONTACT_INFO.phoneFormatted}
              </motion.a>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.a variants={fadeUp} {...tapPrimary} href={CONTACT_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-dark-card border border-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all">
                <Linkedin size={20} />
              </motion.a>
              <motion.a variants={fadeUp} {...tapPrimary} href={CONTACT_INFO.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-dark-card border border-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all">
                <Github size={20} />
              </motion.a>
            </div>
          </div>


          {/* Copyright Bar */}
          <motion.div variants={fadeUp} className="border-t border-gray-800 py-6 text-center text-sm text-gray-600 font-medium">
             © {new Date().getFullYear()} {USER_INFO.name}. All Rights Reserved. Designed to impress.
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
