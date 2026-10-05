type ChecklistSubmitBarProps = {
  unrecorded: number;
  busy: boolean;
  progress: string;
  onSubmit: () => void;
};

export function ChecklistSubmitBar({ unrecorded, busy, progress, onSubmit }: ChecklistSubmitBarProps) {
  return (
    <div className="check-footer">
      <span aria-live="polite">
        {progress ||
          (unrecorded > 0
            ? `미확인 항목 ${unrecorded}개를 모두 확인하면 등록할 수 있습니다. 작성 내용은 이 브라우저에만 임시 저장됩니다.`
            : "모든 항목을 확인했습니다. ‘안전성평가 완료 후 등록’을 눌러야 서버에 등록됩니다.")}
      </span>
      <button type="button" className="btn primary check-submit" disabled={busy || unrecorded > 0} onClick={onSubmit}>
        {busy ? "등록 중…" : "안전성평가 완료 후 등록"}
      </button>
    </div>
  );
}
