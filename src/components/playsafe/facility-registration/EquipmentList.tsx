import type { ReactNode, RefObject } from "react";
import { EQUIPMENT_CLOSED_MESSAGE } from "@/data/playsafe/facility-registration";
import type { EquipmentRow } from "@/data/playsafe/types";
import { EQUIPMENT_PANEL_ID } from "./EquipmentAddPanel";

type EquipmentListProps = {
  rows: readonly EquipmentRow[];
  closed: boolean;
  adding: boolean;
  addButtonRef: RefObject<HTMLButtonElement | null>;
  addPanel: ReactNode;
  onToggleAdd: () => void;
  onRemove: (id: string) => void;
  onExport: () => void;
  onStartAssessment: () => void;
  startBusy?: boolean;
};

export function EquipmentList({
  rows,
  closed,
  adding,
  addButtonRef,
  addPanel,
  onToggleAdd,
  onRemove,
  onExport,
  onStartAssessment,
  startBusy = false,
}: EquipmentListProps) {
  const visibleRows = closed ? [] : rows;

  return (
    <>
      <div className="facility-toolbar">
        <p>
          {closed ? (
            <strong className="facility-closed-label">놀이기구 없음 (종결)</strong>
          ) : (
            <>
              등록된 놀이기구 <strong>{rows.length}개</strong>
            </>
          )}
        </p>
        {!closed && (
          <button
            ref={addButtonRef}
            type="button"
            className={adding ? "btn" : "btn primary"}
            aria-expanded={adding}
            aria-controls={adding ? EQUIPMENT_PANEL_ID : undefined}
            onClick={onToggleAdd}
          >
            {adding ? "추가 닫기 ✕" : "＋ 놀이기구 추가"}
          </button>
        )}
      </div>
      {!closed && addPanel}
      <div className="facility-table-wrap">
        <table className="facility-table">
          <thead>
            <tr>
              <th>임시기구번호</th>
              <th>기구사진</th>
              <th>기구유형</th>
              <th>설치일자</th>
              <th>메모</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td className={closed ? "facility-empty facility-closed" : "facility-empty"} colSpan={6}>
                  {closed ? EQUIPMENT_CLOSED_MESSAGE : "놀이기구가 존재하지 않습니다."}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    {row.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- data URL preview
                      <img className="facility-thumb" src={row.photo} alt="등록 기구사진" />
                    ) : (
                      "미등록"
                    )}
                  </td>
                  <td>{row.type}</td>
                  <td>{row.date}</td>
                  <td className="facility-memo">{row.memo}</td>
                  <td>
                    <button type="button" className="btn" onClick={() => onRemove(row.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="facility-actions">
        <button type="button" className="btn" onClick={onExport}>
          등록정보 JSON 다운로드
        </button>
        <button type="button" className="btn primary" onClick={onStartAssessment} disabled={startBusy}>
          {startBusy ? "저장 중…" : "안전성평가 시작 →"}
        </button>
      </div>
      <p className="facility-status">
        아직 서버에 등록되지 않습니다. ‘안전성평가 시작’을 누르면 등록정보가 이 브라우저에 임시 저장되고, 안전성평가를 마친
        뒤 ‘안전성평가 완료 후 등록’으로 한 번에 등록됩니다.
      </p>
    </>
  );
}
