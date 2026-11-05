import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fetchWithAuth } from "../utils/apiConfig";
import { cardHoverSubtle } from "../utils/motionVariants";
import {
  springSnappy,
  springStiff,
} from "../utils/motionConfig";
import { useSectionReveal } from "../hooks/useSectionReveal";
import { markPortfolioBootTask } from "../utils/portfolioBoot";

// ── Decorative SVG atoms ────────────────────────────────────────

const PlusMark = ({ className = "" }) => (
  <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="5" y1="0" x2="5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CornerBracket = ({ className = "" }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M0 8 L0 0 L8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DiamondDot = ({ className = "" }) => (
  <svg className={className} width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <rect x="4" y="0.5" width="5" height="5" transform="rotate(45 4 0.5)" fill="currentColor" />
  </svg>
);

const CircleDot = ({ className = "" }) => (
  <svg className={className} width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const Hexagon = ({ className = "" }) => (
  <svg className={className} width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
    <path d="M7 1 L13 4.5 L13 11.5 L7 15 L1 11.5 L1 4.5 Z" stroke="currentColor" strokeWidth="1" />
  </svg>
);

// ── Featured card (first / hero project) ───────────────────────

const FeaturedCard = ({ project }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="relative group rounded-2xl overflow-hidden border border-gray-800 hover:border-green-900/50 bg-[#111613] transition-colors duration-300 flex flex-col md:flex-row portfolio-project-card portfolio-project-featured"
  >
    {/* Corner brackets */}
    <CornerBracket className="absolute top-4 left-4 text-green-500/20 z-20 pointer-events-none" />
    <div className="absolute top-4 right-4 z-20 rotate-90 pointer-events-none">
      <CornerBracket className="text-green-500/20" />
    </div>
    <div className="absolute bottom-4 left-4 z-20 -rotate-90 pointer-events-none">
      <CornerBracket className="text-green-500/20" />
    </div>
    <div className="absolute bottom-4 right-4 z-20 rotate-180 pointer-events-none">
      <CornerBracket className="text-green-500/20" />
    </div>

    {/* Image panel */}
    <div className="md:w-[48%] h-64 md:h-auto relative overflow-hidden bg-dark-bg border-b md:border-b-0 md:border-r border-gray-800/50 shrink-0 min-h-70 portfolio-project-image">
      {project.base64Image ? (
        <img
          src={project.base64Image}
          alt={project.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center ${project.color || "bg-gray-900"}`}>
          <span className={`text-8xl font-black opacity-10 ${project.accent}`}>
            {project.title.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      {/* Desktop gradient toward content */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-[#111613] opacity-40 pointer-events-none hidden md:block" />
      {/* Mobile gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-[#111613] via-transparent to-transparent opacity-60 pointer-events-none md:hidden" />

      {/* Featured badge */}
      <div className="absolute top-5 left-5 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-green-500/30 rounded-full">
        <DiamondDot className="text-green-400 w-1.5 h-1.5" />
        <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Featured</span>
      </div>
    </div>

    {/* Content panel */}
    <div className="flex flex-col justify-center p-8 md:p-12 grow portfolio-project-content">
      <div className="flex items-center gap-2 mb-4">
        <PlusMark className="text-green-500/60 w-2.5 h-2.5" />
        <span className="text-green-500 text-xs font-bold uppercase tracking-widest">{project.type || "Project"}</span>
      </div>
      <h3 className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-green-400 transition-colors duration-300 leading-tight">
        {project.title}
      </h3>
      <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm">
        {project.description.length > 160
          ? project.description.substring(0, 160) + "…"
          : project.description}
      </p>
      <Link
        href={`/project/${project._id || project.id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-green-400 transition-colors group/link w-fit border-b border-gray-700 pb-1 hover:border-green-500"
      >
        View project
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
      </Link>
    </div>
  </motion.div>
);

// ── Regular grid card ───────────────────────────────────────────

const ProjectCard = ({ project }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.93, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.93, y: 20 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    {...cardHoverSubtle}
    className="rounded-2xl overflow-hidden bg-[#111613] border border-gray-800 hover:border-green-900/50 flex flex-col group transition-colors duration-300 relative portfolio-project-card"
  >
    {/* Bottom-right corner decoration */}
    <div className="absolute bottom-3 right-3 z-20 rotate-180 pointer-events-none">
      <CornerBracket className="text-gray-700/50 group-hover:text-green-500/25 transition-colors duration-300" />
    </div>

    {/* Thumbnail */}
    <div className={`h-48 w-full flex items-center justify-center relative overflow-hidden bg-dark-bg border-b border-gray-800/50 portfolio-project-image ${project.base64Image ? "" : project.color}`}>
      {project.base64Image ? (
        <img
          src={project.base64Image}
          alt={project.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      ) : (
        <span className={`text-6xl font-black opacity-20 ${project.accent}`}>
          {project.title.substring(0, 2).toUpperCase()}
        </span>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-[#111613] via-transparent to-transparent opacity-60 pointer-events-none" />
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col grow portfolio-project-content">
      <div className="flex items-center justify-between mb-2">
        <span className="text-green-500 text-xs font-bold uppercase tracking-widest">{project.type || "Project"}</span>
        <CircleDot className="text-gray-700 group-hover:text-green-500/40 transition-colors duration-300 w-2 h-2" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors duration-300 leading-snug">
        {project.title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-5 grow">
        {project.description.length > 90
          ? project.description.substring(0, 90) + "…"
          : project.description}
      </p>
      <Link
        href={`/project/${project._id || project.id}`}
        className="inline-flex items-center text-sm font-bold text-white hover:text-green-400 transition-colors"
      >
        See full project
        <motion.span className="ml-2" whileHover={{ x: 3 }} transition={springSnappy}>→</motion.span>
      </Link>
    </div>
  </motion.div>
);

// ── Main component ──────────────────────────────────────────────

const Projects = () => {
  const [filter, setFilter] = useState("All");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef(null);

  useSectionReveal(headerRef, {
    target: ".reveal-item",
    stagger: 0.1,
    y: 15,
    start: "top 95%",
  });

  const fetchProjects = async () => {
    let requestFailed = false;
    try {
      const res = await fetchWithAuth("/api/projects");
      const data = await res.json();
      if (data.success && data.projects.length > 0) {
        const activeProjects = data.projects.filter((p) => p.isActive !== false);
        setProjects(activeProjects.length > 0 ? activeProjects : []);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      requestFailed = true;
      setProjects([]);
    } finally {
      markPortfolioBootTask("data", requestFailed ? "failed" : "ready");
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProjects();
  }, []);

  const categories = ["All", "web", "mobile"];
  const displayCategories = { All: "All", web: "Web App", mobile: "Mobile App" };
  const filteredProjects =
    filter === "All" ? projects : projects.filter((p) => p.type === filter);

  if (!loading && projects.length === 0) return null;

  return (
    <section
      className="py-24 bg-[#0a0a0a] border-t border-gray-800/50 relative overflow-hidden"
      id="projects"
    >
      {/* ── Background scatter decorations ── */}
      <PlusMark className="absolute top-14  left-[7%]  text-gray-700/35 w-3 h-3" />
      <CircleDot className="absolute top-24  left-[15%] text-gray-700/25 w-2 h-2" />
      <DiamondDot className="absolute top-40  left-[5%]  text-green-500/10 w-3 h-3" />
      <Hexagon className="absolute top-10  right-[5%] text-gray-700/15 w-5 h-5" />
      <PlusMark className="absolute top-20  right-[11%] text-gray-700/35 w-3 h-3" />
      <CircleDot className="absolute top-36  right-[20%] text-gray-700/25 w-2 h-2" />
      <DiamondDot className="absolute top-1/2 left-[3%]  text-gray-700/15 w-2 h-2" />
      <Hexagon className="absolute top-[44%] left-[8%] text-green-500/8 w-4 h-4" />
      <PlusMark className="absolute bottom-24 left-[13%] text-gray-700/25 w-3 h-3" />
      <CircleDot className="absolute bottom-14 right-[14%] text-gray-700/25 w-2 h-2" />
      <DiamondDot className="absolute bottom-32 right-[5%]  text-green-500/10 w-3 h-3" />
      <PlusMark className="absolute bottom-10 right-[9%]  text-gray-700/20 w-2 h-2" />
      <Hexagon className="absolute bottom-20 left-[40%]  text-gray-700/10 w-4 h-4" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* ── Section Header ── */}
        <div ref={headerRef} className="mb-14">
          <div className="reveal-item flex items-center gap-4 mb-6">
            <div className="w-12 h-0.5 bg-green-500" />
            <span className="text-green-500 font-bold tracking-widest uppercase text-sm">
              Selected Works
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="reveal-item text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Things I've
              <br />
              <span className="text-emerald-500">Built</span> Recently
            </h2>
            <p className="reveal-item text-gray-400 max-w-xs leading-relaxed text-sm md:text-right">
              A selection of projects spanning full-stack web apps and
              interactive UIs.
            </p>
          </div>

          {/* Decorative rule */}
          <div className="reveal-item flex items-center gap-3 mt-8">
            <div className="flex-1 h-px bg-linear-to-r from-green-500/40 to-transparent" />
            <DiamondDot className="text-green-500/50 w-2 h-2" />
            <div className="w-8 h-px bg-gray-700/50" />
          </div>

          {/* Filter bar */}
          <div className="reveal-item flex flex-wrap gap-3 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`relative px-5 py-2 rounded-xl font-medium transition-colors duration-300 z-10 text-sm ${
                  filter === cat
                    ? "text-black"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {filter === cat && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-gray-200 rounded-xl -z-10 shadow-lg"
                    transition={springStiff}
                  />
                )}
                {filter !== cat && (
                  <div className="absolute inset-0 border border-gray-700 rounded-xl -z-10" />
                )}
                {displayCategories[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Project content ── */}
        {loading ? (
          <div className="space-y-6">
            {/* Featured skeleton */}
            {/* <div className="rounded-2xl overflow-hidden bg-[#111613] border border-gray-800 animate-pulse flex flex-col md:flex-row min-h-70">
              <div className="md:w-[48%] h-64 md:h-auto bg-gray-800/40" />
              <div className="flex-1 p-10 flex flex-col gap-4">
                <div className="h-3 bg-gray-800/40 rounded w-20" />
                <div className="h-8 bg-gray-800/40 rounded w-3/4" />
                <div className="h-4 bg-gray-800/40 rounded w-full" />
                <div className="h-4 bg-gray-800/40 rounded w-5/6" />
              </div>
            </div> */}
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-[#111613] border border-gray-800 animate-pulse"
                >
                  <div className="h-48 bg-gray-800/40" />
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-3 bg-gray-800/40 rounded w-16" />
                    <div className="h-5 bg-gray-800/40 rounded w-2/3" />
                    <div className="h-3 bg-gray-800/40 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-[#111613] border border-gray-800 animate-pulse"
                >
                  <div className="h-48 bg-gray-800/40" />
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-3 bg-gray-800/40 rounded w-16" />
                    <div className="h-5 bg-gray-800/40 rounded w-2/3" />
                    <div className="h-3 bg-gray-800/40 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center border border-dashed border-gray-800 rounded-2xl bg-[#111613]/50"
          >
            <PlusMark className="text-gray-700 w-6 h-6 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">
              No projects found in this category.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Featured — always the first item in filtered list */}
            {/* <AnimatePresence mode="popLayout">
              <FeaturedCard
                key={`feat-${filteredProjects[0]._id || filteredProjects[0].id}`}
                project={filteredProjects[0]}
              />
            </AnimatePresence> */}

            {/* Regular grid — remaining items */}
            {filteredProjects.length > 0 && (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {/* {filteredProjects.slice(1).map((project) => ( */}
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project._id || project.id}
                      project={project}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
