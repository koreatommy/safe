"use client";

import { useEffect, useRef } from "react";
import { NOT_TARGET_SUMMARY, NOT_TARGET_TITLE } from "@/data/playsafe/facility-registration";
import type { FailedCriterion } from "@/data/playsafe/types";
import { FailedCriteriaList } from "./FailedCriteriaList";
import "./not-target-dialog.css";

type NotTargetDialogProps = {
  open: boolean;
  criteria: readonly FailedCriterion[];
  saving: boolean;
  saved: boolean;
  onClose: () => void;
  onReview: () => void;
  onSave: () => void;
};

export function NotTargetDialog({ open, criteria, saving, saved, onClose, onReview, onSave }: NotTargetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="not-target-dialog"
      aria-labelledby="not-target-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="not-target-body">
        <span className="not-target-icon" aria-hidden="true">!</span>
        <h2 id="not-target-title">{NOT_TARGET_TITLE}</h2>
        <p>{NOT_TARGET_SUMMARY}</p>
        <p className="not-target-sub">아래 기준을 만족하지 않아 안전성평가를 시작할 수 없습니다.</p>
        <FailedCriteriaList criteria={criteria} />
        <p className="not-target-sub">
          {saved
            ? "시설정보와 판단 기준 답변이 대상 아님으로 저장되었습니다."
            : "종결 정보를 저장하면 기구정보 없이 시설정보와 판단 기준 답변만 저장됩니다."}
        </p>
      </div>
      <div className="not-target-actions">
        <button type="button" className="btn" onClick={onReview}>
          판단 기준 다시 확인
        </button>
        <button type="button" className="btn" onClick={onSave} disabled={saving}>
          {saving ? "저장 중…" : saved ? "종결 정보 다시 저장" : "종결 정보 저장"}
        </button>
        <button type="button" className="btn primary" onClick={onClose} autoFocus>
          확인
        </button>
      </div>
    </dialog>
  );
}
