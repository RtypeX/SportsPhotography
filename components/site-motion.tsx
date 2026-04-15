"use client";

import { type CSSProperties, useEffect, useRef } from "react";

export function SiteMotion() {
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let progressFrame = 0;
    let cursorFrame = 0;
    let nextCursorX = 50;
    let nextCursorY = 24;

    const updateProgress = () => {
      if (progressFrame) {
        return;
      }

      progressFrame = window.requestAnimationFrame(() => {
        const root = document.documentElement;
        const scrollable = root.scrollHeight - window.innerHeight;
        const next = scrollable <= 0 ? 0 : window.scrollY / scrollable;
        progressRef.current?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, next))})`);
        progressFrame = 0;
      });
    };

    const updateCursor = (event: PointerEvent) => {
      nextCursorX = (event.clientX / window.innerWidth) * 100;
      nextCursorY = (event.clientY / window.innerHeight) * 100;

      if (cursorFrame) {
        return;
      }

      cursorFrame = window.requestAnimationFrame(() => {
        cursorRef.current?.style.setProperty("--cursor-x", `${nextCursorX}%`);
        cursorRef.current?.style.setProperty("--cursor-y", `${nextCursorY}%`);
        cursorFrame = 0;
      });
    };

    updateProgress();

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    window.addEventListener("pointermove", updateCursor, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("pointermove", updateCursor);
      if (progressFrame) {
        window.cancelAnimationFrame(progressFrame);
      }
      if (cursorFrame) {
        window.cancelAnimationFrame(cursorFrame);
      }
    };
  }, []);

  return (
    <>
      <div className="site-progress" aria-hidden="true">
        <span ref={progressRef} style={{ transform: "scaleX(0)" }} />
      </div>
      <div className="site-ambient" aria-hidden="true">
        <span
          ref={cursorRef}
          className="site-ambient__orb site-ambient__orb--cursor"
          style={{ "--cursor-x": "50%", "--cursor-y": "24%" } as CSSProperties}
        />
        <span className="site-ambient__orb site-ambient__orb--alpha" />
        <span className="site-ambient__orb site-ambient__orb--beta" />
        <span className="site-ambient__grid" />
      </div>
    </>
  );
}
