import { useEffect, useRef } from "react";
import gsap from "gsap";

const CursorFollower = () => {
  const dotRef = useRef(null);
  const trailerRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const trailer = trailerRef.current;
    if (!dot || !trailer) return;

    const onMove = (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.06, ease: "power3.out" });
      gsap.to(trailer, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power3.out" });
    };

    const onEnterInteractive = () => {
      gsap.to(trailer, { scale: 1.8, borderColor: "rgba(34,197,94,0.8)", duration: 0.25, ease: "power2.out" });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };

    const onLeaveInteractive = () => {
      gsap.to(trailer, { scale: 1, borderColor: "rgba(34,197,94,0.45)", duration: 0.25, ease: "power2.out" });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMove);

    // Attach hover listeners to all interactive elements after DOM is ready
    const attach = () => {
      const els = document.querySelectorAll("a, button, [role='button'], input, textarea, select, label");
      els.forEach((el) => {
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
      return els;
    };

    const els = attach();

    // Use MutationObserver to re-attach on DOM changes (dynamic content)
    const observer = new MutationObserver(() => {
      const newEls = document.querySelectorAll("a, button, [role='button'], input, textarea, select, label");
      newEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterInteractive);
        el.removeEventListener("mouseleave", onLeaveInteractive);
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      els.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterInteractive);
        el.removeEventListener("mouseleave", onLeaveInteractive);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden lg:block" />
      <div ref={trailerRef} className="cursor-trailer hidden lg:block" />
    </>
  );
};

export default CursorFollower;
