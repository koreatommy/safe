"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ImageIcon, Loader2, X } from "lucide-react";

type ImageLightboxProps = {
  open: boolean;
  url: string;
  name: string;
  onClose: () => void;
};

export function ImageLightbox({ open, url, name, onClose }: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} 미리보기`}
            className="flex w-full max-w-4xl max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 shadow-2xl shadow-black/60"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#00ff88]/15 text-[#00ff88]">
                <ImageIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{name}</p>
                {size && (
                  <p className="text-xs text-white/40 tabular-nums">
                    {size.width} × {size.height}px
                  </p>
                )}
              </div>
              <a
                href={url}
                download={name}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/80 transition-colors hover:border-white/25 hover:text-white"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">다운로드</span>
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/60"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="relative flex min-h-[240px] flex-1 items-center justify-center overflow-auto bg-black/40 p-3 sm:p-5">
              {!loaded && <Loader2 className="absolute h-6 w-6 animate-spin text-white/40" />}
              {/* eslint-disable-next-line @next/next/no-img-element -- 서명 URL이라 next/image 최적화 대상이 아니다 */}
              <img
                src={url}
                alt={name}
                onLoad={(event) => {
                  setLoaded(true);
                  setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight });
                }}
                className={`max-h-[72vh] w-auto max-w-full rounded-lg object-contain transition-opacity duration-200 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

            <footer className="flex justify-end border-t border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-lg border border-[#00ff88] bg-[#00ff88]/20 px-5 text-sm text-white transition-colors hover:bg-[#00ff88]/30"
              >
                닫기
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
