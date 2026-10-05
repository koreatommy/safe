import type { RiskType } from "@/data/playsafe/types";
import { RiskGuideContent } from "./RiskGuideContent";

type RiskPanelProps = {
  risk: RiskType;
  labelledBy: string;
};

export function RiskPanel({ risk, labelledBy }: RiskPanelProps) {
  return (
    <div className="risk-panel" id="riskPanel" role="tabpanel" tabIndex={0} aria-labelledby={labelledBy}>
      <RiskGuideContent risk={risk} />
    </div>
  );
}
