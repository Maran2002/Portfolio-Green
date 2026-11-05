import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fetchWithAuth, CONTACT_INFO } from "../utils/apiConfig";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  tapPrimary
} from "../utils/motionConfig";
import { useSectionReveal } from "../hooks/useSectionReveal";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useSectionReveal(containerRef, { target: ".reveal-item", stagger: 0.1, y: 15, start: "top 95%" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      setLoading(true);
      const response = await fetchWithAuth("/send-email", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        toast.success("Message Sent", {
          description: "Message received successfully, we will reach you soon!",
          duration: 4000,
        });
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
      } else {
        toast.error("Oops...", {
          description: "Something went wrong. Failed to send message!",
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error("Oops...", {
        description: "Something went wrong. Failed to send message!",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 bg-[#0a0a0a] relative overflow-hidden" id="contact" ref={containerRef}>

      {/* ── Decorative SVG layer ────────────────────────────────── */}

      {/* Large faint arc — centred behind the whole section */}
      
      {/* <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 0.5, scale: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <svg width="700" height="700" viewBox="0 0 700 700" fill="none">
          <circle cx="350" cy="350" r="300" stroke="#22c55e" strokeWidth="1" strokeDasharray="6 12" />
          <circle cx="350" cy="350" r="220" stroke="#22c55e" strokeWidth="0.5" />
          <circle cx="350" cy="350" r="140" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 8" />
        </svg>
      </motion.div> */}


      {/* Dot grid — left side */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        className="absolute top-0 left-0 w-72 h-full pointer-events-none hidden md:block"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid-contact" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.8" fill="#22c55e" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid-contact)" />
        </svg>
      </motion.div>

      {/* Dot grid — right side */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.35 }}
        className="absolute top-0 right-0 w-48 h-full pointer-events-none hidden md:block"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid-contact-r" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.8" fill="#10b981" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid-contact-r)" />
        </svg>
      </motion.div>

      {/* Diagonal lines + circle — top right (original) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.8 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute -top-10 right-0 pointer-events-none hidden md:block"
      >
        <svg width="420" height="420" viewBox="0 0 400 400" fill="none">
          <path d="M400 0 L0 400" stroke="#22c55e" strokeWidth="1" strokeDasharray="10 10" />
          <path d="M400 100 L100 400" stroke="#10b981" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M400 200 L200 400" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="3 8" />
          <circle cx="350" cy="50" r="40" stroke="#22c55e" strokeWidth="1.5" />
          <circle cx="350" cy="50" r="20" stroke="#22c55e" strokeWidth="0.5" />
        </svg>
      </motion.div>

      {/* Corner bracket — bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 0.12, x: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
        className="absolute bottom-8 left-6 pointer-events-none hidden md:block"
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M0 40 L0 0 L40 0" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M80 40 L80 80 L40 80" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* Floating scatter marks — bottom right */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.15 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        className="absolute bottom-12 right-8 pointer-events-none hidden md:block"
      >
        <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
          {/* plus marks */}
          <line x1="10" y1="6" x2="10" y2="18" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="12" x2="16" y2="12" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="50" y1="2" x2="50" y2="10" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" />
          <line x1="46" y1="6" x2="54" y2="6" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" />
          <line x1="100" y1="20" x2="100" y2="32" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="94" y1="26" x2="106" y2="26" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />
          {/* diamond dots */}
          <rect x="28" y="40" width="7" height="7" transform="rotate(45 31.5 43.5)" fill="#22c55e" />
          <rect x="78" y="60" width="5" height="5" transform="rotate(45 80.5 62.5)" fill="#22c55e" />
          <rect x="10" y="68" width="5" height="5" transform="rotate(45 12.5 70.5)" fill="#10b981" />
          {/* small circles */}
          <circle cx="60" cy="80" r="3" stroke="#22c55e" strokeWidth="1" />
          <circle cx="110" cy="55" r="2" fill="#22c55e" />
          <circle cx="30" cy="90" r="2" fill="#10b981" />
        </svg>
      </motion.div>

      {/* Horizontal rule accent — top of section */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      >
        <svg width="100%" height="1" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100%" y2="0" stroke="url(#hgrad)" strokeWidth="1" />
          <defs>
            <linearGradient id="hgrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
              <stop offset="30%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-start relative"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* Left Column */}
          <div className="flex flex-col">
            <div className="reveal-item flex items-center mb-8">
              <div className="w-16 h-0.5 bg-green-500 mr-4"></div>
              <span className="text-gray-300 font-semibold tracking-wider text-sm">Contacts</span>
            </div>

            <h2 className="reveal-item text-5xl md:text-6xl font-black text-white leading-tight mb-2">
              Want to connect?
            </h2>
            <h2 className="reveal-item text-5xl md:text-6xl font-black text-white leading-tight mb-12">
              Let's talk!
            </h2>

            <div className="reveal-item">
              <motion.button
                {...tapPrimary}
                type="submit"
                disabled={loading}
                className="group w-auto self-start inline-flex items-center gap-3 px-8 py-4 bg-green-500 text-black font-bold text-base rounded-full hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.35)] hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5 duration-200" />
                  </>
                )}
              </motion.button>
            </div>

            <div className="reveal-item mt-16 pt-6 flex gap-6">
              <a href={CONTACT_INFO.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
              <a href={CONTACT_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="/resume" className="text-gray-400 hover:text-white transition-colors">Resume</a>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8 mt-8 md:mt-20">
            <div className="reveal-item">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-transparent border-b text-white py-3 focus:outline-none transition-colors placeholder-gray-500 text-lg ${
                  errors.name ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-green-500"
                }`}
                placeholder="Name"
              />
              {errors.name && (
                <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1.5">
                  <span>⚠</span> {errors.name}
                </p>
              )}
            </div>
            <div className="reveal-item">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-transparent border-b text-white py-3 focus:outline-none transition-colors placeholder-gray-500 text-lg ${
                  errors.email ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-green-500"
                }`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1.5">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>
            <div className="reveal-item">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full bg-transparent border-b text-white py-3 focus:outline-none transition-colors resize-none placeholder-gray-500 text-lg h-32 ${
                  errors.message ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-green-500"
                }`}
                placeholder="Message"
              ></textarea>
              {errors.message && (
                <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1.5">
                  <span>⚠</span> {errors.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
