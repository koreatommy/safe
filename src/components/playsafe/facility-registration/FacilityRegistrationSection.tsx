"use client";

import Script from "next/script";
import { useToast } from "@/components/playsafe/checklist/useToast";
import { DAUM_POSTCODE_SRC } from "@/lib/playsafe/daumPostcode";
import { scrollToStep } from "@/lib/playsafe/scrollToStep";
import { SectionHead } from "../shared/SectionHead";
import { Toast } from "../shared/Toast";
import { EligibilityStep } from "./EligibilityStep";
import { EquipmentStep } from "./EquipmentStep";
import { FacilitySteps } from "./FacilitySteps";
import { FACILITY_FORM_ID, ManagerFacilityForm } from "./ManagerFacilityForm";
import { SubmitterFields } from "./SubmitterFields";
import { useApplicationSave } from "./useApplicationSave";
import { useFacilityRegistration } from "./useFacilityRegistration";
import { useRegistrationDraftRestore } from "./useRegistrationDraftRestore";
import "./facility-registration.css";
import "./eligibility.css";

export function FacilityRegistrationSection() {
  const state = useFacilityRegistration();
  const application = useApplicationSave(state);
  const toast = useToast();
  useRegistrationDraftRestore(state.hydrate, () => toast.show("이 브라우저에 임시 저장된 시설정보를 불러왔습니다."));

  return (
    <section className="section white" id="facility-registration">
      <Script src={DAUM_POSTCODE_SRC} strategy="lazyOnload" />
      <div className="wrap">
        <SectionHead
          eyebrow="FACILITY INFO"
          title="시설정보입력"
          description="관리주체와 시설 정보를 남기고, 유사 놀이기구 판단 기준을 확인한 뒤 기구를 등록하세요. 시설정보와 등록신청 내용은 신규설치 등록신청의 ‘선택 확인’을 누를 때 저장되고, 기구정보와 안전성평가는 ‘안전성평가 완료 후 등록’을 누를 때 함께 등록됩니다."
          tag="신규설치 등록신청 흐름"
        />
        <FacilitySteps />

        <article className="facility-block" id="step1">
          <header className="facility-block-title">
            <span className="facility-number">1</span>
            <div>
              <h2>관리주체·시설정보 입력</h2>
              <p>관리주체와 시설의 기본 정보를 입력합니다. 입력자 정보와 시설명은 필수이며 나머지 항목은 선택사항입니다.</p>
            </div>
            <SubmitterFields
              formId={FACILITY_FORM_ID}
              submitter={state.submitter}
              locked={Boolean(state.registrationId)}
              onChange={state.updateSubmitter}
            />
          </header>
          <ManagerFacilityForm
            info={state.info}
            photos={state.facilityPhotos}
            consented={Boolean(state.consentAt)}
            onConsent={(checked) => state.setConsentAt(checked ? new Date().toISOString() : null)}
            onChange={state.updateInfo}
            onPhotosChange={state.setFacilityPhotos}
            onNext={() => scrollToStep("step2")}
            onToast={toast.show}
          />
        </article>

        <EligibilityStep state={state} application={application} onToast={toast.show} />

        <EquipmentStep state={state} applicationSaved={application.registered} onToast={toast.show} />
      </div>

      <Toast message={toast.message} />
    </section>
  );
}
