import { scrollToStep } from "@/lib/playsafe/scrollToStep";
import { validateSubmitter } from "@/lib/playsafe-workflow/validation/submitter";
import type { useFacilityRegistration } from "./useFacilityRegistration";

/** DB 저장 전에 1단계 필수값(입력자·시설명·동의)을 확인하고, 문제가 있으면 1단계로 돌려보낸다. */
export function facilityInputsReady(
  state: ReturnType<typeof useFacilityRegistration>,
  onToast: (message: string) => void,
): boolean {
  const form = document.querySelector<HTMLFormElement>(".facility-form");
  if (form && !form.reportValidity()) {
    scrollToStep("step1");
    return false;
  }
  const problem = !state.info.facilityName.trim()
    ? "시설명을 입력해 주세요."
    : !state.consentAt
      ? "개인정보 수집 동의 후 진행해 주세요."
      : validateSubmitter(state.submitter);
  if (problem) {
    onToast(problem);
    scrollToStep("step1");
    return false;
  }
  return true;
}
