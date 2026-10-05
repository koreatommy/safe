"use client";

import { useCallback, useState } from "react";
import { FileText } from "lucide-react";
import { ImageLightbox } from "./ImageLightbox";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp)$/i;

function isImageFileName(name: string) {
  return IMAGE_EXT.test(name);
}

interface AttachmentPreviewProps {
  name: string;
  url: string;
  thumbUrl?: string | null;
  className?: string;
}

export function AttachmentPreview({ name, url, thumbUrl, className = "" }: AttachmentPreviewProps) {
  const [imgError, setImgError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const isImage = isImageFileName(name) && !imgError;
  const closePreview = useCallback(() => setPreviewOpen(false), []);

  if (isImage) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-label={`${name} 크게 보기`}
          className="block w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 cursor-zoom-in hover:border-[#00ff88]/50 transition-colors text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 서명 URL이라 next/image 최적화 대상이 아니다 */}
          <img
            src={thumbUrl ?? url}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </button>
        <a href={url} download={name} className="text-white/50 text-xs truncate max-w-[8rem]">
          다운로드
        </a>
        <ImageLightbox open={previewOpen} url={url} name={name} onClose={closePreview} />
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
