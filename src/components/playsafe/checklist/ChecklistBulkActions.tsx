import { NO_RISK_STATUS, NOT_APPLICABLE_STATUS } from "@/data/playsafe/checks";
import type { CheckRecord, CheckStatus } from "@/data/playsafe/types";
import { ChecklistBulkToggle } from "./ChecklistBulkToggle";

const BULK_STATUSES: CheckStatus[] = [NO_RISK_STATUS, NOT_APPLICABLE_STATUS];

type ChecklistBulkActionsProps = {
  records: CheckRecord[];
  onSetAll: (status: CheckStatus) => void;
};

export function ChecklistBulkActions({ records, onSetAll }: ChecklistBulkActionsProps) {
  const appliedStatus = BULK_STATUSES.find((status) => records.every((r) => r.status === status));

  return (
    <div className="check-bulk">
      {BULK_STATUSES.map((status) => (
        <ChecklistBulkToggle key={status} status={status} records={records} onSetAll={onSetAll} />
      ))}
      <span className="check-bulk-hint">
        {appliedStatus
          ? `체크를 해제하면 ${records.length}개 항목이 다시 미확인으로 돌아갑니다.`
          : `체크하면 ${records.length}개 항목이 한 번에 선택한 상태로 표기됩니다.`}
      </span>
    </div>
  );
}
