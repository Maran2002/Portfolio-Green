"use client";

import { useEffect, useRef, useState } from "react";
import { getPortfolioBootSnapshot, startPortfolioBoot, subscribeToPortfolioBoot } from "../../utils/portfolioBoot";

const EMPTY_SNAPSHOT = {
  tasks: { shell: "pending", fonts: "pending", assets: "pending", scene: "pending", data: "pending" },
  progress: 0,
  timedOut: false,
  failed: false,
};

function getStatus(snapshot) {
  if (snapshot.timedOut) return "Continuing in the background";
  if (snapshot.tasks.shell === "pending") return "Preparing interface";
  if (snapshot.tasks.fonts === "pending" || snapshot.tasks.assets === "pending") return "Loading assets";
  if (snapshot.tasks.scene === "pending") return "Initializing environment";
  if (snapshot.tasks.data === "pending") return "Finalizing experience";
  return snapshot.failed ? "Opening with a fallback" : "Experience ready";
}

export default function PortfolioBootLoader({ enabled, projectDetails = false }) {
  const bootSnapshot = enabled ? getPortfolioBootSnapshot() : null;
  const [snapshot, setSnapshot] = useState(bootSnapshot || EMPTY_SNAPSHOT);
  const [visible, setVisible] = useState(Boolean(enabled && bootSnapshot?.progress !== 100));
  const [leaving, setLeaving] = useState(false);
  const enteredAt = useRef(null);
  const entered = useRef(false);
  const leaveTimer = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    return subscribeToPortfolioBoot(setSnapshot);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const current = getPortfolioBootSnapshot();
    if (current?.progress === 100) return;
    if (!entered.current) {
      entered.current = true;
      enteredAt.current = Date.now();
      setVisible(true);
    }
    startPortfolioBoot({ projectDetails });
  }, [enabled, projectDetails]);

  useEffect(() => {
    if (!enabled || !visible || leaving || snapshot.progress < 100 || !enteredAt.current) return undefined;

    const minimumDisplayMs = 520;
    const dwell = Math.max(0, minimumDisplayMs - (Date.now() - enteredAt.current));
    leaveTimer.current = window.setTimeout(() => {
      setLeaving(true);
      const exitDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 620;
      hideTimer.current = window.setTimeout(() => setVisible(false), exitDuration);
    }, dwell);

    return () => {
      window.clearTimeout(leaveTimer.current);
      window.clearTimeout(hideTimer.current);
    };
  }, [enabled, leaving, snapshot.progress, visible]);

  useEffect(() => () => {
    window.clearTimeout(leaveTimer.current);
    window.clearTimeout(hideTimer.current);
  }, []);

  if (!enabled || !visible) return null;

  const status = getStatus(snapshot);

  return (
    <div className={`portfolio-boot-screen${leaving ? " is-leaving" : ""}`} role="status" aria-live="polite" aria-busy={snapshot.progress < 100}>
      <div className="portfolio-boot-ambient" aria-hidden="true" />

      <div className="portfolio-boot-content">
        <div className="portfolio-boot-visual" aria-hidden="true">
          <div className="portfolio-boot-halo" />
          <div className="portfolio-boot-orbit portfolio-boot-orbit-a"><span /></div>
          <div className="portfolio-boot-orbit portfolio-boot-orbit-b"><span /></div>
          <div className="portfolio-boot-cube">
            <div className="portfolio-boot-cube-face">
              <svg viewBox="0 0 64 48" fill="none">
                <path d="M21 11 7 24l14 13M43 11l14 13-14 13M36 7 28 41" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="portfolio-boot-cube-side" />
          </div>
          <i className="portfolio-boot-particle particle-a" />
          <i className="portfolio-boot-particle particle-b" />
          <i className="portfolio-boot-particle particle-c" />
          <i className="portfolio-boot-particle particle-d" />
        </div>

        <div className="portfolio-boot-brand"><span className="portfolio-boot-brand-mark">&lt;/&gt;</span><span>ELAMARAN</span><i /></div>
        <p className="portfolio-boot-eyebrow">PERSONAL PORTFOLIO / MERN ENGINEER</p>
        <h1 className="portfolio-boot-title">INITIALIZING <span>EXPERIENCE</span></h1>

        <div className="portfolio-boot-progress-meta">
          <span className="portfolio-boot-status"><i />{status}</span>
          <span className="portfolio-boot-percent" aria-label={`${snapshot.progress}% loaded`}>{snapshot.progress}<small>%</small></span>
        </div>
        <div
          className="portfolio-boot-progress-track"
          role="progressbar"
          aria-label="Portfolio startup progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={snapshot.progress}
        >
          <span style={{ width: `${snapshot.progress}%` }} />
        </div>
        <p className="portfolio-boot-footnote">Preparing your next interaction<span> · </span>one moment</p>
      </div>
    </div>
  );
}
