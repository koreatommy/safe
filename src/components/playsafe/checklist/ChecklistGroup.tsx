import { useState } from "react";
import { checkItems, RISK_FOUND_STATUS, UNRECORDED_STATUS } from "@/data/playsafe/checks";
import { riskTypes } from "@/data/playsafe/risks";
import type { CheckRecord } from "@/data/playsafe/types";
import type { ChecklistGroupData } from "@/lib/playsafe/checklistGroups";
import { RiskGuideContent } from "../risks/RiskGuideContent";
import { ChecklistRow } from "./ChecklistRow";
import type { ChecklistRecordActions } from "./types";

type ChecklistGroupProps = {
  order: number;
  group: ChecklistGroupData;
  records: CheckRecord[];
  actions: ChecklistRecordActions;
};

export function ChecklistGroup({ order, group, records, actions }: ChecklistGroupProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const total = group.indices.length;
  const recorded = group.indices.filter((i) => records[i].status !== UNRECORDED_STATUS).length;
  const riskFound = group.indices.some((i) => records[i].status === RISK_FOUND_STATUS);
  const risk = riskTypes.find((r) => r.name === group.category);
  const headingId = `check-group-${order}`;
  const guideId = `check-guide-${order}`;

  return (
    <section className="check-group" aria-labelledby={headingId}>
      <header className="check-group-head" data-open={guideOpen}>
        <span className="check-group-no">{String(order).padStart(2, "0")}</span>
        <h3 id={headingId}>
          {risk ? (
            <button
              type="button"
              className="check-group-toggle"
              aria-expanded={guideOpen}
              aria-controls={guideId}
              onClick={() => setGuideOpen((open) => !open)}
            >
              {group.category}
              <span className="check-group-guide-label">작성 가이드 {guideOpen ? "▲" : "▼"}</span>
            </button>
          ) : (
            group.category
          )}
        </h3>
        {riskFound && <span className="check-group-alert">위험요소 있음</span>}
        <span className="check-group-count" data-done={recorded === total}>
          {recorded} / {total}
        </span>
      </header>
      {risk && (
        <div className="check-guide" id={guideId} hidden={!guideOpen}>
          <RiskGuideContent risk={risk} titleAs="h4" />
        </div>
      )}
      {group.indices.map((i) => (
        <ChecklistRow
          key={checkItems[i].label}
          index={i}
          item={checkItems[i]}
          record={records[i]}
          {...actions}
        />
      ))}
    </section>
  );
}
