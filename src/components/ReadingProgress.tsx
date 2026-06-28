"use client";

import { useEffect, useState } from "react";

/**
 * Slim fixed progress bar at the very top of the viewport that tracks how far
 * the reader has scrolled through the document. Purely decorative, so it is
 * hidden from assistive tech and only animates when motion is allowed.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    const onScroll = () => {
      // Coalesce scroll/resize bursts into one update per animation frame.
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-emerald-500 to-gold-400 motion-safe:transition-[width] motion-safe:duration-100 motion-safe:ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
