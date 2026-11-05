"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Code2, ExternalLink, Github, Globe, Layers3, Smartphone } from "lucide-react";
import { fetchWithAuth } from "../utils/apiConfig";
import { markPortfolioBootTask } from "../utils/portfolioBoot";
import PageTransition from "./common/PageTransition";
import {
  staggerContainerSlow,
  staggerContainerFast,
  fadeUp,
  scaleInBounce,
  fadeIn,
} from "../utils/motionVariants";
import { tapPrimary, springCinematic } from "../utils/motionConfig";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const heroImageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProject = async () => {
      let requestFailed = false;
      try {
        const res = await fetchWithAuth("/api/projects");
        const data = await res.json();
        let found = null;
        if (data.success && data.projects.length > 0) {
          found = data.projects.find(
            (item) => (item._id === id || String(item.id) === id) && item.isActive !== false
          );
        }
        setProject(found);
      } catch (err) {
        console.error("Failed to fetch", err);
        requestFailed = true;
        setLoadFailed(true);
      } finally {
        markPortfolioBootTask("data", requestFailed ? "failed" : "ready");
        setLoading(false);
      }
    };
    loadProject();
  }, [id]);

  useEffect(() => {
    if (loading) return undefined;
    if (!project?.base64Image) {
      markPortfolioBootTask("assets", loadFailed ? "failed" : "ready");
      return undefined;
    }

    const image = heroImageRef.current;
    if (!image) {
      markPortfolioBootTask("assets", "failed");
      return undefined;
    }

    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      markPortfolioBootTask("assets", result);
    };
    const decode = () => {
      if (image.naturalWidth <= 0) {
        settle("failed");
      } else if (typeof image.decode === "function") {
        image.decode().then(() => settle("ready")).catch(() => settle("failed"));
      } else {
        settle("ready");
      }
    };
    const onLoad = () => decode();
    const onError = () => settle("failed");

    if (image.complete) {
      decode();
    } else {
      image.addEventListener("load", onLoad, { once: true });
      image.addEventListener("error", onError, { once: true });
    }

    return () => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
    };
  }, [loadFailed, loading, project]);

  if (loading) {
    return (
      <PageTransition variant="fade">
        <div className="public-site project-detail-page min-h-screen pt-14 text-white lg:pt-0">
          <div className="project-detail-hero project-detail-hero-loading min-h-[380px] md:min-h-[490px]">
            <div className="container mx-auto max-w-6xl px-5 pb-12 pt-8 md:px-8 md:pt-10">
              <div className="h-10 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="mt-28 h-4 w-36 animate-pulse rounded-full bg-emerald-300/15" />
              <div className="mt-5 h-14 w-2/3 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
          <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-10 md:px-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.75fr)]">
            <div className="project-detail-panel h-72 animate-pulse" />
            <div className="project-detail-panel h-56 animate-pulse" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition variant="fade">
        <div className="public-site project-detail-page flex min-h-[80vh] items-center justify-center px-5 pt-14 text-white lg:pt-0">
          <div className="project-detail-not-found max-w-lg rounded-3xl p-8 text-center md:p-12">
            <span className="project-detail-not-found-icon mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Layers3 size={27} />
            </span>
            <p className="project-detail-kicker mb-3">PROJECT ARCHIVE / 404</p>
            <h1 className="mb-4 text-3xl font-black tracking-tight text-white md:text-4xl">Project not found</h1>
            <p className="mb-8 leading-relaxed text-slate-400">This project may have been removed or the link may have expired.</p>
            <Link href="/#projects" className="project-detail-button project-detail-button-secondary">
              <ArrowLeft size={16} /> Back to projects
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const isWebProject = project.type === "web";
  const projectType = isWebProject ? "Web application" : "Mobile application";

  return (
    <PageTransition variant="slideUp">
      <div className="public-site project-detail-page min-h-screen pb-16 pt-14 text-white lg:pt-0">
        <section className="project-detail-hero relative isolate flex min-h-[440px] items-end overflow-hidden md:min-h-[540px]">
          {project.base64Image ? (
            <motion.img
              ref={heroImageRef}
              initial={{ scale: 1.08, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springCinematic}
              src={project.base64Image}
              alt={`${project.title} preview`}
              className="project-detail-hero-image absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className={`project-detail-hero-fallback absolute inset-0 flex items-center justify-center ${project.color || ""}`}
            >
              <span className={`project-detail-monogram select-none ${project.accent || ""}`} aria-hidden="true">
                {project.title.substring(0, 2).toUpperCase()}
              </span>
            </motion.div>
          )}

          <div className="project-detail-hero-shade absolute inset-0" aria-hidden="true" />
          <div className="project-detail-hero-grid absolute inset-0" aria-hidden="true" />

          <div className="container relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-7 md:px-8 md:pb-14 md:pt-9">
            <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.45 }}>
              <Link href="/" className="project-detail-back inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold">
                <ArrowLeft size={15} /> Back to portfolio
              </Link>
            </motion.div>

            <motion.div initial="hidden" animate="show" variants={staggerContainerSlow} className="mt-24 flex flex-col items-start justify-between gap-7 md:mt-32 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <motion.div variants={fadeUp} className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="project-detail-kicker">SELECTED WORK</span>
                  <span className="project-detail-divider" aria-hidden="true" />
                  <span className="project-detail-type inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.16em]">
                    {isWebProject ? <Globe size={13} /> : <Smartphone size={13} />}
                    {projectType}
                  </span>
                </motion.div>
                <motion.h1 variants={fadeUp} className="max-w-3xl text-4xl font-black leading-[.98] tracking-[-.055em] text-white sm:text-5xl md:text-7xl">
                  {project.title}
                </motion.h1>
              </div>

              {project.url && (
                <motion.a
                  variants={fadeUp}
                  {...tapPrimary}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-detail-button project-detail-button-primary shrink-0"
                >
                  Visit live project <ExternalLink size={16} />
                </motion.a>
              )}
            </motion.div>

            <div className="project-detail-hero-foot mt-9 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.2em]">
              <span className="project-detail-status-dot" />
              <span>Case study</span>
              <span className="project-detail-divider" aria-hidden="true" />
              <span>Built with intention</span>
            </div>
          </div>
        </section>

        <main className="container relative z-10 mx-auto -mt-2 max-w-6xl px-5 pb-12 pt-8 md:px-8 md:pt-12">
          <div className="project-detail-section-head mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="project-detail-section-mark"><Code2 size={16} /></span>
              <p className="project-detail-kicker">PROJECT BREAKDOWN</p>
            </div>
            <span className="hidden text-[10px] font-bold tracking-[.2em] text-emerald-100/35 sm:block">01 / 01</span>
          </div>

          <motion.div initial="hidden" animate="show" variants={staggerContainerSlow} className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.75fr)] lg:gap-6">
            <div className="space-y-5">
              <motion.section variants={fadeUp} className="project-detail-panel project-detail-overview rounded-3xl p-6 md:p-9">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="project-detail-kicker mb-2">01 / OVERVIEW</p>
                    <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">The idea behind the build</h2>
                  </div>
                  <span className="project-detail-panel-icon hidden sm:flex"><Code2 size={18} /></span>
                </div>
                <p className="project-detail-copy whitespace-pre-wrap text-sm leading-7 md:text-base md:leading-8">
                  {project.description}
                </p>
              </motion.section>

              {project.complexity && (
                <motion.section variants={fadeUp} className="project-detail-panel rounded-3xl p-6 md:p-9">
                  <p className="project-detail-kicker mb-2">02 / ENGINEERING</p>
                  <h2 className="mb-5 text-xl font-bold tracking-tight text-white md:text-2xl">Engineering complexity</h2>
                  <p className="project-detail-copy whitespace-pre-wrap text-sm leading-7 md:text-base md:leading-8">
                    {project.complexity}
                  </p>
                </motion.section>
              )}
            </div>

            <aside className="space-y-5">
              <motion.section variants={fadeUp} className="project-detail-panel rounded-3xl p-6 md:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="project-detail-panel-icon"><Layers3 size={17} /></span>
                  <div>
                    <p className="project-detail-kicker">STACK / 01</p>
                    <h2 className="mt-1 text-base font-bold text-white">Technologies</h2>
                  </div>
                </div>
                {project.tech?.length ? (
                  <motion.div variants={staggerContainerFast} className="flex flex-wrap gap-2">
                    {project.tech.map((technology) => (
                      <motion.span variants={scaleInBounce} key={technology} className="project-detail-tech-chip rounded-xl px-3 py-2 text-xs font-semibold">
                        {technology}
                      </motion.span>
                    ))}
                  </motion.div>
                ) : (
                  <p className="text-sm text-slate-400">Technology details are not listed for this project.</p>
                )}
              </motion.section>

              {project.link && (
                <motion.section variants={fadeUp} className="project-detail-panel rounded-3xl p-6 md:p-7">
                  <p className="project-detail-kicker mb-4">REPOSITORY / 02</p>
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-detail-repository-link group flex items-center gap-3 rounded-2xl px-4 py-3.5">
                    <span className="project-detail-repo-icon"><Github size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-white">Source code</span>
                      <span className="mt-1 block text-xs text-slate-400">Open repository</span>
                    </span>
                    <ArrowRight size={15} className="text-emerald-300 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </motion.section>
              )}
            </aside>
          </motion.div>

          <motion.section variants={fadeUp} initial="hidden" animate="show" className="project-detail-cta mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl p-6 md:mt-12 md:flex-row md:items-center md:p-9">
            <div>
              <p className="project-detail-kicker mb-2">HAVE A PROJECT IN MIND?</p>
              <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">Let’s build something thoughtful.</h2>
              <p className="mt-2 text-sm text-slate-400">Get in touch to discuss your next idea.</p>
            </div>
            <Link href="/#contact" className="project-detail-button project-detail-button-secondary shrink-0">
              Get in touch <ArrowRight size={16} />
            </Link>
          </motion.section>
        </main>
      </div>
    </PageTransition>
  );
};

export default ProjectDetails;
