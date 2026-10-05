"use client";

import Image from "next/image";
import type { MouseEvent, RefObject } from "react";
import { GUIDE_PAGE_COUNT, GUIDE_PAGE_SIZE, guidePagePath } from "@/lib/playsafe/assets";
import "./source-viewer.css";

type SourceViewerDialogProps = {
  ref: RefObject<HTMLDialogElement | null>;
  page: number;
  onPageChange: (page: number) => void;
};

const PAGE_NUMBERS = Array.from({ length: GUIDE_PAGE_COUNT }, (_, i) => i + 1);

export function SourceViewerDialog({ ref, page, onPageChange }: SourceViewerDialogProps) {
  const close = () => ref.current?.close();

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const outside =
      event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) close();
  };

  return (
    <dialog ref={ref} className="source-dialog" aria-label="가이드라인 원문 뷰어" onClick={closeOnBackdrop}>
      <div className="modal-head">
        <strong>가이드라인 원문</strong>
        <div className="viewer-tools">
          <button type="button" className="btn" aria-label="이전 페이지" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            ←
          </button>
          <select aria-label="원문 페이지 선택" value={page} onChange={(e) => onPageChange(Number(e.target.value))}>
            {PAGE_NUMBERS.map((n) => (
              <option key={n} value={n}>
                PDF {n} / {GUIDE_PAGE_COUNT}쪽
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            aria-label="다음 페이지"
            disabled={page === GUIDE_PAGE_COUNT}
            onClick={() => onPageChange(page + 1)}
          >
            →
          </button>
          <button type="button" className="btn" onClick={close}>
            닫기 ✕
          </button>
        </div>
      </div>
      <div className="viewer">
        <Image
          key={page}
          src={guidePagePath(page)}
          alt={`첨부 가이드라인 PDF ${page}쪽 원문`}
          width={GUIDE_PAGE_SIZE.width}
          height={GUIDE_PAGE_SIZE.height}
          sizes="(max-width: 820px) 100vw, 780px"
        />
      </div>
    </dialog>
  );
}
