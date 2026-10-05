import { RISK_FOUND_STATUS, UNRECORDED_STATUS } from "@/data/playsafe/checks";
import type { CheckRecord, CheckStatus } from "@/data/playsafe/types";

type ChecklistBulkToggleProps = {
  status: CheckStatus;
  records: CheckRecord[];
  onSetAll: (status: CheckStatus) => void;
};

export function ChecklistBulkToggle({ status, records, onSetAll }: ChecklistBulkToggleProps) {
  const allChecked = records.every((r) => r.status === status);
  const riskCount = records.filter((r) => r.status === RISK_FOUND_STATUS).length;
  const photoCount = records.reduce((sum, r) => sum + r.photos.length, 0);

  const toggle = (checked: boolean) => {
    if (!checked) {
      onSetAll(UNRECORDED_STATUS);
      return;
    }
    const photoNotice = photoCount > 0 ? ` 등록한 사진 ${photoCount}장도 삭제됩니다.` : "";
    if (
      riskCount > 0 &&
      !window.confirm(`‘위험요소 있음’ ${riskCount}개 항목도 ‘${status}’으로 바뀝니다.${photoNotice} 계속할까요?`)
    ) {
      return;
    }
    onSetAll(status);
  };

  return (
    <label className="check-bulk-toggle" data-checked={allChecked}>
      <input type="checkbox" checked={allChecked} onChange={(e) => toggle(e.target.checked)} />
      전체 {status}
    </label>
  );
}
