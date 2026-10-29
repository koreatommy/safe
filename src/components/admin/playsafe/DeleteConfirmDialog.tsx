"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type DeleteConfirmDialogProps = {
  facilityName: string;
  message: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmDialog({
  facilityName,
  message,
  deleting,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const onCancelRef = useRef(onCancel);
  const deletingRef = useRef(deleting);
  onCancelRef.current = onCancel;
  deletingRef.current = deleting;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deletingRef.current) onCancelRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
      onClick={() => {
        if (!deleting) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-desc"
        className="playsafe-admin w-full max-w-md rounded-2xl border border-white/15 bg-[#101614] p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-confirm-title" className="text-lg font-semibold text-white">
          시설 삭제
        </h2>
        <p className="mt-2 text-sm font-medium text-[#00ff88]">{facilityName}</p>
        <p id="delete-confirm-desc" className="mt-3 text-sm leading-relaxed text-white/70">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10 disabled:opacity-40"
          >
            취소
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="rounded-lg border border-red-500/50 bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30 disabled:opacity-40"
          >
            {deleting ? "삭제 중…" : "삭제"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
