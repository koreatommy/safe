"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { riskTypes } from "@/data/playsafe/risks";
import { RiskPanel } from "./RiskPanel";

const LAST = riskTypes.length - 1;

function nextIndexForKey(key: string, current: number): number | null {
  if (key === "ArrowDown" || key === "ArrowRight") return current === LAST ? 0 : current + 1;
  if (key === "ArrowUp" || key === "ArrowLeft") return current === 0 ? LAST : current - 1;
  if (key === "Home") return 0;
  if (key === "End") return LAST;
  return null;
}

export function RiskTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndexForKey(event.key, index);
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="risk-layout">
      <div className="risk-nav" role="tablist" aria-label="위험유형" aria-orientation="vertical">
        {riskTypes.map((risk, i) => (
          <button
            key={risk.name}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`riskTab${i}`}
            aria-controls="riskPanel"
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {String(i + 1).padStart(2, "0")}&nbsp;&nbsp;{risk.name}
          </button>
        ))}
      </div>
      <RiskPanel risk={riskTypes[active]} labelledBy={`riskTab${active}`} />
    </div>
  );
}
