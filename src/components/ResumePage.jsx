import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "../utils/apiConfig";

const ResumePage = () => {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const res = await fetchWithAuth("/api/settings");
        const data = await res.json();
        if (data.success && data.settings.resumeUrl) {
          setResumeUrl(data.settings.resumeUrl);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Convert any Google Drive share URL to an embeddable preview URL
  const getGoogleDriveEmbedUrl = (url) => {
    if (!url) return null;

    // Already an embed/preview URL
    if (url.includes("/preview")) return url;

    // Match file ID from common Google Drive URL patterns
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /docs\.google\.com\/\w+\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    // Fallback: return as-is (may be a direct link)
    return url;
  };

  const embedUrl = getGoogleDriveEmbedUrl(resumeUrl);

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-24 pb-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="resumeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#resumeGrid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-green-400" />
              <h1 className="text-xl font-bold text-white">Resume</h1>
            </div>
          </div>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-black font-bold text-sm rounded-full hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
            >
              Open in New Tab <ExternalLink size={14} />
            </a>
          )}
        </motion.div>

        {/* Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-dark-bg border border-gray-800/80 rounded-3xl overflow-hidden shadow-2xl"
          style={{ minHeight: "80vh" }}
        >
          {loading && (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-800/60 rounded-2xl" />
              <div className="h-4 w-48 bg-gray-800/60 rounded" />
              <div className="h-3 w-32 bg-gray-800/40 rounded" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-center px-8">
              <FileText size={48} className="text-gray-600" />
              <h2 className="text-xl font-bold text-white">Resume Not Available</h2>
              <p className="text-gray-400 text-sm max-w-sm">
                The resume link hasn't been configured yet. Please check back later.
              </p>
              <Link href="/" className="mt-4 text-green-400 hover:underline text-sm">
                ← Return Home
              </Link>
            </div>
          )}

          {!loading && !error && embedUrl && (
            <iframe
              src={embedUrl}
              title="Resume Viewer"
              className="w-full border-0"
              style={{ height: "85vh" }}
              allow="autoplay"
              loading="lazy"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResumePage;
