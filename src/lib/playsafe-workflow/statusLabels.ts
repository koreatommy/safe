import type { CheckStatus } from "@/data/playsafe/types";
import {
  NO_RISK_STATUS,
  NOT_APPLICABLE_STATUS,
  RISK_FOUND_STATUS,
  UNRECORDED_STATUS,
} from "@/data/playsafe/checks";
import type { AnswerStatus } from "./types";

export const ANSWER_STATUS_TO_LABEL: Record<AnswerStatus, CheckStatus> = {
  unrecorded: UNRECORDED_STATUS,
  risk_found: RISK_FOUND_STATUS,
  no_risk: NO_RISK_STATUS,
  not_applicable: NOT_APPLICABLE_STATUS,
};

export const LABEL_TO_ANSWER_STATUS: Record<CheckStatus, AnswerStatus> = {
  [UNRECORDED_STATUS]: "unrecorded",
  [RISK_FOUND_STATUS]: "risk_found",
  [NO_RISK_STATUS]: "no_risk",
  [NOT_APPLICABLE_STATUS]: "not_applicable",
};

export function toAnswerStatus(label: CheckStatus): AnswerStatus {
  return LABEL_TO_ANSWER_STATUS[label];
}

export function toCheckLabel(status: AnswerStatus): CheckStatus {
  return ANSWER_STATUS_TO_LABEL[status];
}
