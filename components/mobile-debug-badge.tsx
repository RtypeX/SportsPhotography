"use client";

import { useEffect, useState } from "react";

import { getMobileDebugNetworkInformation, isMobileDebugEnabled, reportMobileDebug } from "@/lib/mobile-debug";

type MobileDebugSnapshot = {
  innerWidth: number;
  innerHeight: number;
  documentWidth: number;
  documentHeight: number;
  visualViewportWidth: number | null;
  visualViewportHeight: number | null;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  isPhone480: boolean;
  isPhone720: boolean;
  orientation: string;
  userAgent: string;
  connectionType: string | null;
  effectiveConnectionType: string | null;
  saveData: boolean | null;
};

function readSnapshot(): MobileDebugSnapshot | null {
  if (typeof window === "undefined" || typeof document === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  const visualViewport = window.visualViewport;
  const { connectionType, effectiveConnectionType, saveData } = getMobileDebugNetworkInformation();

  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    documentWidth: document.documentElement.clientWidth,
    documentHeight: document.documentElement.clientHeight,
    visualViewportWidth: visualViewport ? Math.round(visualViewport.width) : null,
    visualViewportHeight: visualViewport ? Math.round(visualViewport.height) : null,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    isPhone480: window.matchMedia("(max-width: 480px)").matches,
    isPhone720: window.matchMedia("(max-width: 720px)").matches,
    orientation: window.screen.orientation?.type ?? (window.innerWidth > window.innerHeight ? "landscape" : "portrait"),
    userAgent: window.navigator.userAgent,
    connectionType,
    effectiveConnectionType,
    saveData,
  };
}

function formatUserAgent(userAgent: string) {
  if (userAgent.includes("iPhone")) {
    return "iPhone";
  }

  if (userAgent.includes("Android")) {
    return "Android";
  }

  if (userAgent.includes("iPad")) {
    return "iPad";
  }

  return userAgent;
}

export function MobileDebugBadge() {
  const [snapshot, setSnapshot] = useState<MobileDebugSnapshot | null>(null);

  useEffect(() => {
    if (!isMobileDebugEnabled()) {
      return;
    }

    let frameId = 0;

    const updateSnapshot = () => {
      const nextSnapshot = readSnapshot();
      setSnapshot(nextSnapshot);
    };

    frameId = window.requestAnimationFrame(() => {
      const initialSnapshot = readSnapshot();
      setSnapshot(initialSnapshot);
      reportMobileDebug("debug-badge-mounted", initialSnapshot ?? undefined);
    });

    window.addEventListener("resize", updateSnapshot);
    window.addEventListener("orientationchange", updateSnapshot);
    window.visualViewport?.addEventListener("resize", updateSnapshot);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateSnapshot);
      window.removeEventListener("orientationchange", updateSnapshot);
      window.visualViewport?.removeEventListener("resize", updateSnapshot);
    };
  }, []);

  if (snapshot === null) {
    return null;
  }

  return (
    <aside className="mobile-debug-badge" aria-live="polite">
      <strong className="mobile-debug-badge__title">Mobile debug</strong>
      <div className="mobile-debug-badge__grid">
        <span>inner</span>
        <span>
          {snapshot.innerWidth} x {snapshot.innerHeight}
        </span>
        <span>visual</span>
        <span>
          {snapshot.visualViewportWidth ?? "n/a"} x {snapshot.visualViewportHeight ?? "n/a"}
        </span>
        <span>doc</span>
        <span>
          {snapshot.documentWidth} x {snapshot.documentHeight}
        </span>
        <span>screen</span>
        <span>
          {snapshot.screenWidth} x {snapshot.screenHeight}
        </span>
        <span>dpr</span>
        <span>{snapshot.devicePixelRatio}</span>
        <span>{`<=480`}</span>
        <span>{snapshot.isPhone480 ? "yes" : "no"}</span>
        <span>{`<=720`}</span>
        <span>{snapshot.isPhone720 ? "yes" : "no"}</span>
        <span>orient</span>
        <span>{snapshot.orientation}</span>
        <span>net</span>
        <span>
          {[snapshot.connectionType, snapshot.effectiveConnectionType].filter(Boolean).join(" / ") || "n/a"}
        </span>
        <span>saveData</span>
        <span>{snapshot.saveData === null ? "n/a" : snapshot.saveData ? "on" : "off"}</span>
        <span>ua</span>
        <span>{formatUserAgent(snapshot.userAgent)}</span>
      </div>
      <p className="mobile-debug-badge__hint">Use `?mobileDebug=0` to hide this.</p>
    </aside>
  );
}
