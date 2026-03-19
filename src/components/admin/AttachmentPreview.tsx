"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

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
  const isImage = isImageFileName(name) && !imgError;

  if (isImage) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <a href={url} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
          <img
            src={url}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </a>
        <a href={url} download={name} className="text-white/50 text-xs truncate max-w-[8rem]">
          다운로드
        </a>
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
