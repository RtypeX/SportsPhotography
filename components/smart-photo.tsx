"use client";

import { useState, type ImgHTMLAttributes } from "react";

import { reportMobileDebug } from "@/lib/mobile-debug";

type SmartPhotoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  originalSrc: string;
  srcSet?: string;
  debugEvent?: string;
  debugDetails?: Record<string, unknown>;
};

export function SmartPhoto({
  src,
  srcSet,
  originalSrc,
  debugEvent,
  debugDetails,
  onError,
  alt,
  ...props
}: SmartPhotoProps) {
  const [useFallbackSource, setUseFallbackSource] = useState(false);
  const currentSrc = useFallbackSource ? originalSrc : src;
  const currentSrcSet = useFallbackSource ? undefined : srcSet;

  const handleError: ImgHTMLAttributes<HTMLImageElement>["onError"] = (event) => {
    if (debugEvent) {
      reportMobileDebug(debugEvent, {
        ...debugDetails,
        attemptedSrc: currentSrc,
        attemptedSrcSet: currentSrcSet,
        fallbackSrc: originalSrc,
      });
    }

    if (currentSrc !== originalSrc) {
      setUseFallbackSource(true);
    }

    onError?.(event);
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        src={currentSrc}
        srcSet={currentSrcSet}
        alt={alt ?? ""}
        onError={handleError}
      />
    </>
  );
}
