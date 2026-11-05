import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Search, PenTool, Code, Rocket } from "lucide-react";
import { 
  stepPop,
  drawLine
} from "../utils/motionVariants";
import { 
  springBouncy, 
  tapPrimary
} from "../utils/motionConfig";
import { useSectionReveal } from "../hooks/useSectionReveal";

const steps = [
  {
    id: 1,
    title: "Architecture & Planning",
    description: "Analyzing requirements, designing system architecture, and selecting the optimal tech stack.",
    icon: <Search className="text-xl" />,
  },
  {
    id: 2,
    title: "UI/UX Engineering",
    description: "Developing responsive, accessible components with modern CSS features and atomic design.",
    icon: <PenTool className="text-xl" />,
  },
  {
    id: 3,
    title: "Full-Stack Implementation",
    description: "Building robust APIs, handling complex state, and writing clean, maintainable code.",
    icon: <Code className="text-xl" />,
  },
  {
    id: 4,
    title: "Testing & Deployment",
    description: "Ensuring code quality with rigorous testing, CI/CD pipelines, and performance optimization.",
    icon: <Rocket className="text-xl" />,
  },
];

const Workflow = () => {
  const containerRef = useRef(null);
  
  useSectionReveal(containerRef, {
    target: ".reveal-item",
    stagger: 0.15,
    start: "top 95%",
    y: 15,
  });

  return (
    <section id="workflow" ref={containerRef} className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20 reveal-item">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            My Engineering <span className="text-green-500">Workflow</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Desktop Connecting Line (SVG Draw Animation) */}
          <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5 z-0">
            <svg width="100%" height="2" preserveAspectRatio="none">
              <motion.line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="#22c55e"
                strokeWidth="2"
                strokeDasharray="8 8"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="opacity-50"
              />
            </svg>
          </div>

          {steps.map((step) => (
            <div
              key={step.id}
              className="reveal-item relative z-10 flex flex-col items-center text-center group"
            >
              {/* Step Icon Hexagon / Circle */}
              <motion.div
                whileHover={{ scale: 1.06, rotate: 3 }}
                whileTap={{ scale: 0.93 }}
                transition={springBouncy}
                className="w-20 h-20 rounded-2xl bg-dark-card border border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-green-500 group-hover:border-green-500/50 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-colors mb-8 shadow-xl relative"
              >
                {step.icon}

                {/* Step Number Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ ...springBouncy, delay: 0.3 + step.id * 0.1 }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 text-black font-black flex items-center justify-center border-4 border-[#0a0a0a]"
                >
                  {step.id}
                </motion.div>
              </motion.div>

              {/* Content */}
              <div className="bg-dark-card border border-gray-800/80 rounded-2xl p-6 w-full h-full group-hover:border-gray-700 transition-colors">
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center reveal-item">
          <motion.a
            href="#contact"
            {...tapPrimary}
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-black rounded-full font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            Let's Discuss Opportunities
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
