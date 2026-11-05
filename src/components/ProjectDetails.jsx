import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github, ArrowRight, Globe, Smartphone } from "lucide-react";
import { fetchWithAuth, CONTACT_INFO } from "../utils/apiConfig";
import PageTransition from "./common/PageTransition";
import {
  staggerContainerSlow,
  staggerContainerFast,
  fadeUp,
  scaleInBounce,
  fadeIn
} from "../utils/motionVariants";
import {
  tapPrimary,
  springCinematic,
} from "../utils/motionConfig";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProject = async () => {
      try {
        const res = await fetchWithAuth("/api/projects");
        const data = await res.json();
        let found = null;
        if (data.success && data.projects.length > 0) {
          found = data.projects.find(
            (p) => (p._id === id || String(p.id) === id) && p.isActive !== false
          );
        }
        setProject(found);
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <PageTransition variant="fade">
        <div className="min-h-screen bg-dark-bg text-white">
          <div className="h-72 md:h-115 w-full bg-gray-800/20 animate-pulse" />
          <div className="container mx-auto px-4 max-w-5xl pb-24 pt-10 animate-pulse space-y-6">
            <div className="h-4 w-28 bg-gray-800/40 rounded-full" />
            <div className="h-14 w-2/3 bg-gray-800/40 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="md:col-span-2 space-y-4">
                <div className="h-52 bg-gray-800/30 rounded-2xl" />
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-gray-800/30 rounded-2xl" />
                <div className="h-32 bg-gray-800/30 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition variant="fade">
        <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Project Not Found</h2>
            <Link href="/" className="text-green-500 hover:underline">
              Go back to home
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="slideUp">
      <div className="min-h-screen bg-dark-bg text-white">

        {/* ── Hero Banner ──────────────────────────────────────────── */}
        <div className="relative h-72 md:h-115 w-full overflow-hidden bg-[#0a0a0a]">
          {project.base64Image ? (
            <motion.img
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={springCinematic}
              src={project.base64Image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className={`w-full h-full ${project.color} flex items-center justify-center`}
            >
              <span
                className={`text-[10rem] md:text-[14rem] font-black opacity-[0.06] ${project.accent} select-none`}
              >
                {project.title.substring(0, 2).toUpperCase()}
              </span>
            </motion.div>
          )}

          {/* Gradient layers */}
          <div className="absolute inset-0 bg-linear-to-b from-dark-bg/50 via-transparent to-dark-bg" />
          <div className="absolute inset-0 bg-linear-to-r from-dark-bg/30 to-transparent" />

          {/* Back button */}
          <div className="absolute top-6 left-0 right-0 z-20">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.45 }}
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-green-400 transition-colors backdrop-blur-md bg-black/30 border border-white/10 px-4 py-2.5 rounded-full"
                >
                  <ArrowLeft size={15} />
                  Back to Portfolio
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Project type badge — bottom of hero */}
          <div className="absolute bottom-8 left-0 right-0 z-10">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.45 }}
                className="inline-flex items-center gap-2 text-green-400 font-bold tracking-widest text-xs uppercase border border-green-500/30 bg-green-500/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                {project.type === "web" ? (
                  <><Globe size={12} /> Web Application</>
                ) : (
                  <><Smartphone size={12} /> Mobile Application</>
                )}
              </motion.span>
            </div>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <div className="container mx-auto px-4 max-w-5xl pb-24 pt-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainerSlow}
          >
            {/* Title + Live link */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-start justify-between gap-6 mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none max-w-2xl">
                {project.title}
              </h1>
              {project.url && (
                <motion.a
                  {...tapPrimary}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                >
                  Visit Live <ExternalLink size={16} />
                </motion.a>
              )}
            </motion.div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Left — description */}
              <div className="md:col-span-2 space-y-6">
                <motion.div
                  variants={fadeUp}
                  className="bg-dark-card border border-gray-800/60 rounded-2xl p-8"
                >
                  <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-5">
                    Overview
                  </p>
                  <p className="text-gray-300 leading-relaxed text-base whitespace-pre-wrap">
                    {project.description}
                  </p>
                </motion.div>

                {project.complexity && (
                  <motion.div
                    variants={fadeUp}
                    className="bg-dark-card border border-gray-800/60 rounded-2xl p-8"
                  >
                    <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-5">
                      Engineering Complexity
                    </p>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                      {project.complexity}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Right — sidebar */}
              <div className="space-y-5">
                {/* Tech Stack */}
                <motion.div
                  variants={fadeUp}
                  className="bg-dark-card border border-gray-800/60 rounded-2xl p-6"
                >
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
                    Tech Stack
                  </p>
                  <motion.div variants={staggerContainerFast} className="flex flex-wrap gap-2">
                    {project.tech?.map((t) => (
                      <motion.span
                        variants={scaleInBounce}
                        key={t}
                        className="px-3 py-1.5 bg-[#0a0a0a] border border-gray-700/80 text-xs font-semibold rounded-lg text-gray-400 hover:border-green-500/60 hover:text-green-400 transition-all cursor-default"
                      >
                        {t}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Links */}
                {project.link && (
                <motion.div
                  variants={fadeUp}
                  className="bg-dark-card border border-gray-800/60 rounded-2xl p-6"
                >
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
                    Links
                  </p>
                  <div className="space-y-3">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-all font-medium bg-[#0a0a0a] rounded-xl px-4 py-3.5 border border-gray-800/60 hover:border-gray-500/30 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-gray-500/10 border border-gray-700/30 flex items-center justify-center shrink-0 group-hover:bg-gray-500/20 transition-colors">
                        <Github size={13} className="text-gray-400" />
                      </span>
                      Source Code
                      <ArrowRight
                        size={13}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity"
                      />
                    </a>
                  </div>
                </motion.div>
                    )}
              </div>
            </div>

            {/* ── Bottom CTA ────────────────────────────────────────── */}
            <motion.div
              variants={fadeUp}
              className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-dark-card border border-gray-800/60 rounded-2xl"
            >
              <div>
                <p className="text-gray-500 text-sm mb-1">Interested in working together?</p>
                <p className="text-white font-bold text-xl">Let's build something great</p>
              </div>
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 px-8 py-4 border border-green-500/40 text-green-400 hover:bg-green-500/10 rounded-full transition-colors font-bold text-sm shrink-0"
              >
                Get in Touch <ArrowRight size={16} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProjectDetails;
