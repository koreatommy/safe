"use client";

import { useState, useCallback, useEffect } from "react";
import { FileText, X } from "lucide-react";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp)$/i;

function isImageFileName(name: string) {
  return IMAGE_EXT.test(name);
}

interface AttachmentPreviewProps {
  name: string;
  url: string;
  className?: string;
}

export function AttachmentPreview({ name, url, className = "" }: AttachmentPreviewProps) {
  const [imgError, setImgError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const isImage = isImageFileName(name) && !imgError;

  const closePreview = useCallback(() => setPreviewOpen(false), []);
  useEffect(() => {
    if (!previewOpen) return;
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closePreview();
    window.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [previewOpen, closePreview]);

  if (isImage) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="block w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 cursor-pointer hover:border-white/20 transition-colors text-left"
        >
          <img
            src={url}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </button>
        <a href={url} download={name} className="text-white/50 text-xs truncate max-w-[8rem]">
          다운로드
        </a>
        {previewOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closePreview}
            role="dialog"
            aria-modal="true"
            aria-label="이미지 미리보기"
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={url}
              alt={name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-white/50" />
        </div>
        <div className="min-w-0">
          <a href={url} target="_blank" rel="noreferrer" className="text-[#00ff88] text-xs truncate block">
            {name}
          </a>
          <a href={url} download={name} className="text-white/50 text-xs">
            다운로드
          </a>
        </div>
      </div>
    </div>
  );
}
