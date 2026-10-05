import { RISK_FOUND_STATUS, selectableStatuses, UNRECORDED_STATUS } from "@/data/playsafe/checks";
import type { CheckItem, CheckRecord, CheckStatus } from "@/data/playsafe/types";
import { ChecklistPhotoField } from "./ChecklistPhotoField";
import type { ChecklistRecordActions } from "./types";

type ChecklistRowProps = ChecklistRecordActions & {
  index: number;
  item: CheckItem;
  record: CheckRecord;
};

export function ChecklistRow({ index, item, record, onChange, onAddPhoto, onRemovePhoto }: ChecklistRowProps) {
  const no = index + 1;

  const changeStatus = (status: CheckStatus) => {
    const dropsPhotos = status !== RISK_FOUND_STATUS && record.photos.length > 0;
    if (dropsPhotos && !window.confirm(`등록한 사진 ${record.photos.length}장이 삭제됩니다. 상태를 바꿀까요?`)) return;
    onChange(index, { status });
  };

  return (
    <div className="check-row" data-status={record.status}>
      <span className="check-no">{String(no).padStart(2, "0")}</span>
      <label className="check-label" htmlFor={`status${index}`}>
        {item.label}
      </label>
      <select
        id={`status${index}`}
        aria-label={`${no}번 확인 상태`}
        value={record.status}
        onChange={(e) => changeStatus(e.target.value as CheckStatus)}
      >
        <option value={UNRECORDED_STATUS}>선택하세요</option>
        {selectableStatuses.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
      {record.status === RISK_FOUND_STATUS && (
        <ChecklistPhotoField
          no={no}
          photos={record.photos}
          onAdd={(photo) => onAddPhoto(index, photo)}
          onRemove={(id) => onRemovePhoto(index, id)}
        />
      )}
      <textarea
        aria-label={`${no}번 조치 메모`}
        placeholder="발견한 위험 · 개선 조치 · 조치일을 기록하세요"
        value={record.memo}
        onChange={(e) => onChange(index, { memo: e.target.value })}
      />
    </div>
  );
}
