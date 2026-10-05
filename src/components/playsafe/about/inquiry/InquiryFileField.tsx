"use client";

import { useRef } from "react";
import { ALLOWED_ATTACHMENT_TYPES, INQUIRY_LIMITS } from "@/lib/eligibility-inquiry/constants";

const ACCEPT = Object.keys(ALLOWED_ATTACHMENT_TYPES).map((ext) => `.${ext}`).join(",");

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))}KB` : `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

interface InquiryFileFieldProps {
  files: File[];
  disabled: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export function InquiryFileField({ files, disabled, onAdd, onRemove }: InquiryFileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const full = files.length >= INQUIRY_LIMITS.maxFiles;

  return (
    <div className="inquiry-files">
      <span className="inquiry-label">
        첨부파일 <em>선택 · 최대 {INQUIRY_LIMITS.maxFiles}개, 파일당 10MB</em>
      </span>
      <input
        ref={inputRef}
        id="inquiry-files"
        type="file"
        multiple
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          onAdd(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <button type="button" className="inquiry-file-btn" disabled={disabled || full} onClick={() => inputRef.current?.click()}>
        + 파일 선택
      </button>
      <span className="inquiry-hint">사진, PDF, 한글·워드·엑셀 문서, ZIP</span>
      {files.length > 0 && (
        <ul className="inquiry-file-list">
          {files.map((file, i) => (
            <li key={`${file.name}-${file.size}`}>
              <span>{file.name}</span>
              <small>{formatSize(file.size)}</small>
              <button type="button" disabled={disabled} onClick={() => onRemove(i)} aria-label={`${file.name} 삭제`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
