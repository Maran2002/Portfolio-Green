"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Code2, Layers3, Rocket, Server, Download } from "lucide-react";
import { USER_INFO } from "../utils/apiConfig";

const strengths = [
  { title: "React / Next.js", label: "FRONTEND ARCHITECTURE", icon: Code2 },
  { title: "REST / GraphQL", label: "API INTEGRATIONS", icon: Server },
  { title: "Optimized UI", label: "PERFORMANCE", icon: Rocket },
  { title: "JavaScript", label: "CLEAN CODE", icon: Layers3 },
];

export default function Home() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handlePointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({ x: ((event.clientY - bounds.top) / bounds.height - 0.5) * -8, y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 10 });
  };

  return (
    <div id="home" className="hero-shell relative min-h-screen overflow-hidden px-5 pb-20 pt-24 sm:px-8 lg:px-12 lg:pt-20">
      <div aria-hidden="true" className="hero-grid" />
      <div aria-hidden="true" className="hero-glow hero-glow-one" />
      <div aria-hidden="true" className="hero-glow hero-glow-two" />
      <div className="hero-layout relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.04fr_.96fr]">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [.2, .7, .2, 1] }} className="hero-copy">
          <div className="availability-pill"><span className="availability-dot" /> Open to opportunities</div>
          <p className="hero-eyebrow">FULL STACK ENGINEER <span>·</span> MERN</p>
          <h1>Hi, I’m <span className="emerald-text">{USER_INFO.firstName}</span><span className="hero-period">.</span></h1>
          <h2>{USER_INFO.rolePrimary}</h2>
          <p className="hero-description">I architect and build scalable, high-performance web applications. I combine thoughtful interface engineering with robust APIs to create products that feel as good as they work.</p>
          <div className="hero-actions">
            <a href="#projects" className="button-primary">Explore projects <ArrowUpRight size={18} /></a>
            <Link href="/resume" className="button-secondary">Resume <Download size={17} /></Link>
          </div>
          <div className="hero-note"><span className="hero-note-line" /> Available for select collaborations</div>
        </motion.div>

        <div className="hero-visual" onPointerMove={handlePointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
          <div className="orbit orbit-outer" />
          <div className="orbit orbit-inner" />
          <div className="orbit orbit-cross" />
          <div className="orbit-node node-one" /><div className="orbit-node node-two" /><div className="orbit-node node-three" />
          <motion.div className="tech-cube" style={{ rotateX: tilt.x, rotateY: tilt.y }} transition={{ type: "spring", stiffness: 90, damping: 16 }}>
            <div className="cube-face cube-front"><Code2 size={86} strokeWidth={1.35} /></div>
            <div className="cube-face cube-back"><Code2 size={70} strokeWidth={1.2} /></div>
            <div className="cube-face cube-right" />
            <div className="cube-face cube-left" />
            <div className="cube-face cube-top" />
            <div className="cube-face cube-bottom" />
          </motion.div>
          <div className="visual-caption"><span className="caption-spark" /> Building with clarity <span className="caption-divider">/</span> Shipping with confidence</div>
          <div className="floating-tag tag-react"><Code2 size={17} /> REACT / NEXT.JS</div>
          <div className="floating-tag tag-scale"><Layers3 size={17} /> SCALABLE ARCHITECTURE</div>
          <div className="visual-platform" />
        </div>
      </div>
      <div className="hero-strengths relative z-10 mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-3 lg:mt-8 lg:grid-cols-4 lg:gap-5">
        {strengths.map(({ title, label, icon: Icon }, index) => (
          <motion.div key={title} className="strength-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 + index * .08 }} whileHover={{ y: -5 }}>
            <Icon size={23} strokeWidth={1.8} />
            <strong>{title}</strong>
            <span>{label}</span>
          </motion.div>
        ))}
      </div>
      <a className="scroll-cue" href="#about" aria-label="Scroll to about section"><ArrowDown size={16} /> <span>SCROLL TO EXPLORE</span></a>
    </div>
  );
}
