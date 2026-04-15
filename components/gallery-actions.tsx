"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, DownloadIcon, LoaderCircleIcon, Share2Icon, XIcon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

type GalleryActionsProps = {
  downloadHref: string;
  shareUrl: string;
  shareTitle: string;
  shareText: string;
};

export function GalleryActions({
  downloadHref,
  shareUrl,
  shareTitle,
  shareText,
}: GalleryActionsProps) {
  const [shareMessage, setShareMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showStatus = (message: string) => {
    setShareMessage(message);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setShareMessage("");
      timeoutRef.current = null;
    }, 2200);
  };

  const handleShare = () => {
    startTransition(async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          });
          showStatus("Shared");
          return;
        }

        await navigator.clipboard.writeText(shareUrl);
        showStatus("Link copied");
      } catch {
        showStatus("Share cancelled");
      }
    });
  };

  return (
    <div className="gallery-actions">
      <Button asChild className="gallery-actions__primary" size="lg">
        <a href={downloadHref}>
          <DownloadIcon data-icon="inline-start" />
          Download All Photos
        </a>
      </Button>
      <Button type="button" onClick={handleShare} disabled={isPending} variant="outline" size="lg" className="gallery-actions__button">
        {isPending ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <Share2Icon data-icon="inline-start" />}
        Share Gallery
      </Button>
      <AnimatePresence mode="wait">
        {shareMessage ? (
          <motion.span
            key={shareMessage}
            className="gallery-actions__status"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {shareMessage === "Shared" || shareMessage === "Link copied" ? <CheckIcon /> : <XIcon />}
            {shareMessage}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
