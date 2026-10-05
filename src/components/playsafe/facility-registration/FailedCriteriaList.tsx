import type { FailedCriterion } from "@/data/playsafe/types";

type FailedCriteriaListProps = {
  criteria: readonly FailedCriterion[];
};

export function FailedCriteriaList({ criteria }: FailedCriteriaListProps) {
  return (
    <ul className="facility-failed-list">
      {criteria.map((criterion) => (
        <li key={criterion.number}>
          <span className="facility-failed-number">{criterion.number}</span>
          <div>
            <strong>{criterion.question}</strong>
            <p>{criterion.excludedReason}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
