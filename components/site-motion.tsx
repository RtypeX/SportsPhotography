"use client";

import { type CSSProperties, useEffect, useRef } from "react";

export function SiteMotion() {
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const progressFrameRef = useRef(0);
  const cursorFrameRef = useRef(0);
  const nextCursorXRef = useRef(50);
  const nextCursorYRef = useRef(24);

  useEffect(() => {
    const updateProgress = () => {
      if (progressFrameRef.current) {
        return;
      }

      progressFrameRef.current = window.requestAnimationFrame(() => {
        const root = document.documentElement;
        const scrollable = root.scrollHeight - window.innerHeight;
        const next = scrollable <= 0 ? 0 : window.scrollY / scrollable;
        progressRef.current?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, next))})`);
        progressFrameRef.current = 0;
      });
    };

    const updateCursor = (event: PointerEvent) => {
      nextCursorXRef.current = (event.clientX / window.innerWidth) * 100;
      nextCursorYRef.current = (event.clientY / window.innerHeight) * 100;

      if (cursorFrameRef.current) {
        return;
      }

      cursorFrameRef.current = window.requestAnimationFrame(() => {
        cursorRef.current?.style.setProperty("--cursor-x", `${nextCursorXRef.current}%`);
        cursorRef.current?.style.setProperty("--cursor-y", `${nextCursorYRef.current}%`);
        cursorFrameRef.current = 0;
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
      if (progressFrameRef.current) {
        window.cancelAnimationFrame(progressFrameRef.current);
      }
      if (cursorFrameRef.current) {
        window.cancelAnimationFrame(cursorFrameRef.current);
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
