import React, { useRef, useState, useEffect } from "react";
import photoMine from "../assests/my_img_maran.jpeg";
import Image from "next/image";
import { Handshake } from "lucide-react";
import { motion } from "framer-motion";
import {
  springCinematic,
  tapPrimary
} from "../utils/motionConfig";
import { useSectionReveal } from "../hooks/useSectionReveal";
import { useAmbientFloat } from "../hooks/useAmbientFloat";
import { USER_INFO } from "../utils/apiConfig";

const StatCounter = ({ target, suffix = "", label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let n = 0;
        const step = target / 40;
        const tick = () => {
          n = Math.min(n + step, target);
          setCount(Math.round(n));
          if (n < target) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="text-3xl md:text-4xl font-black text-white tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">{label}</span>
    </div>
  );
};

const About = () => {
  const containerRef = useRef(null);
  const glowRef = useRef(null);

  useAmbientFloat(glowRef, { y: 30, scale: 1.1, duration: 10 });
  useSectionReveal(containerRef, { target: ".reveal-item", stagger: 0.15, y: 15, start: "top 90%" });

  return (
    <article ref={containerRef} className="py-24 bg-[#0a0a0a] border-t border-gray-800/50 relative overflow-hidden" id="about">
      {/* Background Glow */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-0 w-80 h-80 bg-green-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 opacity-20"
      />

      {/* Decorative Dot Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* Section label */}
        <div className="reveal-item opacity-0 flex items-center gap-4 mb-16">
          <div className="w-12 h-0.5 bg-green-500"></div>
          <span className="text-green-500 font-bold tracking-widest uppercase text-sm">About Me</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20 items-start">

          {/* Image Side — slides in from left */}
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main image card */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl group aspect-3/4">
              <div className="absolute inset-0 bg-dark-card z-0"></div>
              <Image
                src={photoMine}
                alt={`${USER_INFO.name} - ${USER_INFO.rolePrimary}`}
                width={420}
                height={560}
                loading="lazy"
                className="w-full h-full object-cover relative z-10 filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-20"></div>

              {/* Name tag */}
              <div className="absolute bottom-5 left-5 z-30">
                <p className="text-white font-bold text-lg leading-tight">{USER_INFO.name}</p>
                <p className="text-green-400 text-xs font-semibold tracking-wide">{USER_INFO.rolePrimary}</p>
              </div>
            </div>

            {/* Offset decorative border */}
            <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border border-green-500/20 -z-10 pointer-events-none"></div>

          </motion.div>

          {/* Content Side */}
          <div className="flex flex-col justify-center space-y-8 lg:py-8">
            <div className="reveal-item opacity-0">
              <span className="text-green-500 font-bold tracking-widest uppercase text-sm border border-green-500/30 bg-green-500/10 px-4 py-1.5 rounded-full inline-block mb-4">
                Engineering Mindset
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Building <span className="text-emerald-500">Scalable</span> UI
              </h2>
            </div>

            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
              <p className="reveal-item opacity-0">
I am a Full-Stack Software Engineer with a strong focus on backend architecture and RESTful APIs across the MERN stack. I specialize in translating complex requirements into secure, scalable systems that perform under real load.              </p>

              <p className="reveal-item opacity-0">
Beyond just writing code, I prioritize system design, clean architecture, and reliable service integrations. Whether it's optimizing database queries, architecting microservices with Kafka and Nginx, or building secure APIs, my goal is to deliver robust, production-ready solutions.              </p>
            </div>

            {/* Stat counters */}
            <div className="reveal-item opacity-0 grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-800/50">
              <StatCounter target={Number(USER_INFO.yearsExp) || 0}  suffix="+" label="Years Exp." />
              <StatCounter target={Number(USER_INFO.projectsCount) || 0} suffix="+" label="Projects" />
              <StatCounter target={Number(USER_INFO.clientsCount) || 0}  suffix="+"  label="Clients" />
            </div>

            <div className="flex flex-wrap gap-4 reveal-item opacity-0">
              <motion.a
                href="#contact"
                {...tapPrimary}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl shadow-lg shadow-white/10"
              >
                Let's Talk <Handshake className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
};

export default About;
