import React, { useState, useEffect } from "react";
import { Menu, X, Github, Linkedin, Mail, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import photoMine from "../assests/my_img_maran.jpeg";
import { CONTACT_INFO, USER_INFO } from "../utils/apiConfig";
import { springCinematic, springSnappy } from "../utils/motionConfig";

const roles = USER_INFO.roles;

const navLinks = [
  { name: "Home",     path: "#home",         id: "home" },
  { name: "About",    path: "#about",         id: "about" },
  { name: "Services", path: "#capabilities",  id: "capabilities" },
  { name: "Projects", path: "#projects",      id: "projects" },
  { name: "Workflow", path: "#workflow",      id: "workflow" },
  { name: "Skills",   path: "#skills",        id: "skills" },
  { name: "Contact",  path: "#contact",       id: "contact" },
];

const Header = () => {
  const [isOpen, setIsOpen]       = useState(false);
  const [activeSection, setActive] = useState("home");
  const [roleIdx, setRoleIdx]     = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin  = pathname.startsWith("/admin");

  // Cycle role text
  useEffect(() => {
    const id = setInterval(() => setRoleIdx((i) => (i + 1) % roles.length), 2800);
    return () => clearInterval(id);
  }, []);

  // Active-section tracking via Intersection Observer
  useEffect(() => {
    if (pathname !== "/") {
      setActive("");
      return;
    }

    const options = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    
    const timer = setTimeout(() => {
      navLinks.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    setIsOpen(false);
    const id = path.replace("#", "");
    
    if (pathname === "/") {
      setTimeout(() => {
        window.history.pushState(null, "", path);
        const el = document.getElementById(id);
        if (el) {
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: "smooth" });
        }
      }, isOpen ? 320 : 0);
    } else {
      router.push("/" + path);
    }
  };

  // Minimal bar on admin routes
  if (isAdmin) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/6 flex items-center px-6">
        <Link href="/" className="text-white font-black tracking-widest uppercase text-sm">
          {USER_INFO.firstName.substring(0, 3)}<span className="text-green-500">{USER_INFO.firstName.substring(3).toUpperCase()}</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-70 bg-[#0a0a0a] border-r border-white/6 flex-col z-40 overflow-y-auto">

        {/* Identity block */}
        <div className="flex flex-col items-center pt-10 pb-6 px-6 border-b border-white/6">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-22 h-22 rounded-full overflow-hidden border-2 border-green-500/50 shadow-[0_0_24px_rgba(34,197,94,0.18)]">
              <Image
                src={photoMine}
                alt={USER_INFO.name}
                width={88}
                height={88}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#0a0a0a] shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          </div>

          <h2 className="text-white font-black text-lg tracking-tight mb-1.5 text-center">
            {USER_INFO.name}
          </h2>

          {/* Cycling role */}
          <div className="h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIdx}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="block text-green-400 text-[11px] font-bold tracking-widest uppercase text-center"
              >
                {roles[roleIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5">
          <div className="flex flex-col gap-0.5">
            {navLinks.map(({ id, name, path }) => {
              const active = activeSection === id;
              return (
                <motion.a
                  key={id}
                  href={path}
                  onClick={(e) => handleNavClick(e, path)}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                    active ? "text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebarActive"
                      className="absolute inset-0 bg-green-500 rounded-xl -z-10 shadow-[0_0_16px_rgba(34,197,94,0.28)]"
                      transition={springSnappy}
                    />
                  )}
                  {name}
                </motion.a>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-white/6">
            <Link
              href="/resume"
              className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Resume ↗
            </Link>
          </div>
        </nav>

        {/* Social + CTA */}
        <div className="px-5 pb-8 pt-5 border-t border-white/6">
          <div className="flex items-center gap-2.5 mb-4">
            <a
              href={CONTACT_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/8 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              <Github size={15} />
            </a>
            <a
              href={CONTACT_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/8 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              <Linkedin size={15} />
            </a>
            <a
              href={CONTACT_INFO.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LeetCode"
              title="LeetCode"
              className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/8 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              <Code2 size={15} />
            </a>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              aria-label="Email"
              className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/8 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              <Mail size={15} />
            </a>
          </div>

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="block w-full text-center py-2.5 bg-green-500 text-black font-bold text-sm rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_14px_rgba(34,197,94,0.2)]"
          >
            Hire Me
          </a>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ─────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springCinematic}
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/92 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-5 h-14"
      >
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="text-lg font-black text-white tracking-widest uppercase"
        >
          {USER_INFO.firstName.substring(0, 3)}<span className="text-green-500">{USER_INFO.firstName.substring(3).toUpperCase()}</span>
        </a>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 flex items-center justify-center text-white"
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={springSnappy}>
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={springSnappy}>
                <Menu size={22} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-[76%] max-w-xs bg-[#0a0a0a] border-r border-white/6 z-50 flex flex-col overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-14 border-b border-white/6 shrink-0">
                <span className="text-lg font-black text-white tracking-widest uppercase">
                  {USER_INFO.firstName.substring(0, 3)}<span className="text-green-500">{USER_INFO.firstName.substring(3).toUpperCase()}</span>
                </span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Avatar row */}
              <div className="flex items-center gap-4 px-5 py-5 border-b border-white/6 shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-green-500/50 shrink-0">
                  <Image src={photoMine} alt={USER_INFO.name} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{USER_INFO.name}</p>
                  <p className="text-green-400 text-[11px] font-semibold tracking-wide uppercase">{roles[roleIdx]}</p>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-4 py-4 overflow-y-auto">
                {navLinks.map(({ id, name, path }) => {
                  const active = activeSection === id;
                  return (
                    <a
                      key={id}
                      href={path}
                      onClick={(e) => handleNavClick(e, path)}
                      className={`flex items-center px-4 py-3 mb-1 rounded-xl font-semibold text-sm transition-colors ${
                        active ? "bg-green-500 text-black" : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {name}
                    </a>
                  );
                })}
                <Link
                  href="/resume"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 mt-1 rounded-xl font-semibold text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Resume ↗
                </Link>
              </nav>

              {/* Social + CTA */}
              <div className="px-5 pb-8 pt-4 border-t border-white/6 shrink-0">
                <div className="flex gap-2.5 mb-4">
                  <a href={CONTACT_INFO.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Github size={15} />
                  </a>
                  <a href={CONTACT_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Linkedin size={15} />
                  </a>
                  <a href={CONTACT_INFO.leetcode} target="_blank" rel="noopener noreferrer" aria-label="LeetCode" title="LeetCode" className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Code2 size={15} />
                  </a>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Mail size={15} />
                  </a>
                </div>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, "#contact")}
                  className="block w-full text-center py-3 bg-green-500 text-black font-bold text-sm rounded-xl"
                >
                  Hire Me
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
