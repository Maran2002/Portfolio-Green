import React, { useRef } from "react";
import { Code, Smartphone, Cloud, Database, Server, Cpu, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { 
  springSnappy, 
  tapPrimary
} from "../utils/motionConfig";
import { useSectionReveal } from "../hooks/useSectionReveal";
import { useAmbientFloat } from "../hooks/useAmbientFloat";

const services = [
  {
    id: 1,
    title: "Frontend Architecture",
    description:
      "Building fast, high-performance web applications using React and Next.js ecosystem.",
    icon: <Code className="text-2xl text-black group-hover:text-white transition-colors duration-300" />,
  },
  {
    id: 2,
    title: "Backend Development",
    description:
      "Developing robust APIs and microservices using Node.js, Express, and efficient routing.",
    icon: <Server className="text-2xl text-black group-hover:text-white transition-colors duration-300" />,
  },
  {
    id: 3,
    title: "Database Design",
    description:
      "Structuring and optimizing data models using MongoDB, SQL, and effective caching strategies.",
    icon: <Database className="text-2xl text-black group-hover:text-white transition-colors duration-300" />,
  },
  {
    id: 4,
    title: "State Management",
    description:
      "Integrating robust REST/GraphQL APIs and managing complex application state efficiently.",
    icon: <Smartphone className="text-2xl text-black group-hover:text-white transition-colors duration-300" />,
  },
  {
    id: 5,
    title: "Performance Tuning",
    description:
      "Enhancing Core Web Vitals, implementing lazy loading, and asset optimization for maximum speed.",
    icon: <Cpu className="text-2xl text-black group-hover:text-white transition-colors duration-300" />,
  },
  {
    id: 6,
    title: "Cloud Deployment",
    description:
      "Deploying and scaling applications on modern cloud infrastructure with optimized CI/CD pipelines.",
    icon: <Cloud className="text-2xl text-black group-hover:text-white transition-colors duration-300" />,
  },
];

const MyServices = () => {
  const sectionRef = useRef(null);
  const glowRef = useRef(null);

  useAmbientFloat(glowRef, { y: 20, rotation: 10, duration: 8 });
  useSectionReveal(sectionRef, { target: ".reveal-item", stagger: 0.1, y: 15, start: "top 90%" });

  return (
    <section ref={sectionRef} className="py-24 bg-[#0a0a0a] relative overflow-hidden" id="capabilities">
      {/* Background accents */}
      <div 
        ref={glowRef}
        className="absolute top-1/2 left-0 w-96 h-96 bg-green-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 opacity-20"
      />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-10">
          <div className="md:w-1/2 reveal-item">
            <div className="flex items-center mb-6">
              <div className="w-12 h-0.5 bg-green-600 mr-4"></div>
              <span className="text-green-600 font-medium text-sm tracking-wider">Core Engineering</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight uppercase tracking-tight">
              Capabilities
            </h2>
          </div>

          <div className="md:w-1/2 flex flex-col items-start md:items-end text-left md:text-right reveal-item">
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed text-sm md:text-base">
              Here are my core competencies that allow me to architect and deliver scalable, high-performance full-stack web applications.
            </p>
            <motion.a
              href="#projects"
              {...tapPrimary}
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg text-sm"
            >
              View Projects
            </motion.a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="reveal-item">
              <motion.div
                whileHover={{
                  y: -5,
                  borderColor: "rgba(34,197,94,0.4)",
                  backgroundColor: "#1c1c1c",
                  transition: springSnappy,
                }}
                whileTap={{
                  scale: 0.97,
                  transition: springSnappy,
                }}
                className="group bg-[#171717] p-8 rounded-3xl flex flex-col items-start border border-gray-800/40 transition-all duration-300 relative overflow-hidden h-full"
              >
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Comet decoration (top-right corner) */}
              <svg
                className="absolute top-5 right-5 w-14 h-14 opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
                viewBox="0 0 56 56" fill="none"
              >
                <line x1="8" y1="48" x2="48" y2="8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" className="comet-line" />
                <circle cx="48" cy="8" r="3.5" fill="#22c55e" />
                <circle cx="8" cy="48" r="1.5" fill="#22c55e" opacity="0.4" />
              </svg>

              {/* Card number label */}
              <span className="text-gray-600 text-xs font-black tracking-[0.2em] mb-5 block group-hover:text-green-600/60 transition-colors duration-300">
                {String(service.id).padStart(2, "0")}/
              </span>

              <div className="relative mb-7">
                {/* Dotted accent */}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[radial-gradient(circle,white_2px,transparent_2px)] bg-size-[8px_8px] opacity-10 group-hover:opacity-30 transition-all duration-500" />

                {/* Icon box */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  transition={springSnappy}
                  className="w-14 h-14 bg-white group-hover:bg-green-600 transition-colors duration-500 rounded-2xl flex items-center justify-center relative z-10 shadow-xl"
                >
                  {service.icon}
                </motion.div>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300 mb-3 flex items-center gap-2">
                {service.title}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-green-400" />
              </h3>

              <p className="text-gray-400 text-base leading-relaxed">
                {service.description}
              </p>

              {/* Expanding bottom line */}
              <div className="mt-6 w-8 h-0.5 bg-gray-800 group-hover:w-full group-hover:bg-green-900/50 transition-all duration-500" />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyServices;
