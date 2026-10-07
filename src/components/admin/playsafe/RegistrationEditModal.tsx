"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { AdminRegistrationDetail } from "@/lib/playsafe-workflow/adminTypes";
import { useAdminRegistrationEdit } from "@/hooks/useAdminRegistrationEdit";
import { usePlaysafeAdminDetail } from "@/hooks/usePlaysafeAdminDetail";
import { EditAssessmentForm } from "./EditAssessmentForm";
import { EditEquipmentForm } from "./EditEquipmentForm";
import { EditFacilityInfoForm } from "./EditFacilityInfoForm";
import { EditFacilityPhotoForm } from "./EditFacilityPhotoForm";
import "./playsafe-admin.css";

type RegistrationEditModalProps = {
  registrationId: string;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

function EditDialog({
  title,
  saving,
  onClose,
  children,
}: {
  title: string;
  saving: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const onCloseRef = useRef(onClose);
  const savingRef = useRef(saving);
  onCloseRef.current = onClose;
  savingRef.current = saving;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingRef.current) onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-edit-title"
        className="playsafe-admin my-auto w-full max-w-3xl rounded-2xl border border-white/15 bg-[#101614] p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="registration-edit-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"
          >
            닫기
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function RegistrationEditor({
  detail,
  onClose,
  onSaved,
}: {
  detail: AdminRegistrationDetail;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const edit = useAdminRegistrationEdit(detail);
  const notice = edit.saveError ?? edit.photoError;
  const locked = edit.busy || edit.saving;

  return (
    <EditDialog title={`${detail.registration.information.facilityName || "시설"} 수정`} saving={edit.saving} onClose={onClose}>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void edit.save().then((saved) => {
            if (saved) void onSaved();
          });
        }}
      >
        <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60">
          임시시설번호와 평가대상 여부, 등록신청 판단 기준은 이 화면에서 바꾸지 않습니다. 이미 등록된 안전성평가의 18개 항목과 위험요소 사진은 수정할 수 있습니다.
        </p>
        {notice ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">{notice}</div>
        ) : null}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white/85">관리주체·시설정보</h3>
          <EditFacilityInfoForm
            submitterName={edit.draft.submitterName}
            submitterEmail={edit.draft.submitterEmail}
            information={edit.draft.information}
            onSubmitterName={edit.setSubmitterName}
            onSubmitterEmail={edit.setSubmitterEmail}
            onInformation={edit.setInformation}
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white/85">시설 전경사진</h3>
          <EditFacilityPhotoForm
            photos={edit.draft.facilityPhotos}
            disabled={locked}
            onAdd={(files) => void edit.addFacilityPhotos(files)}
            onRemove={edit.removeFacilityPhoto}
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white/85">기구정보</h3>
          <EditEquipmentForm
            rows={edit.draft.equipment}
            disabled={locked}
            onAdd={edit.addEquipment}
            onRemove={edit.removeEquipment}
            onChange={edit.changeEquipment}
            onPickPhoto={(id, file) => void edit.pickEquipmentPhoto(id, file)}
            onClearPhoto={edit.clearEquipmentPhoto}
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white/85">안전성평가</h3>
          {edit.draft.assessment ? (
            <EditAssessmentForm
              assessment={edit.draft.assessment}
              disabled={locked}
              onAssessor={edit.setAssessor}
              onEvalDate={edit.setEvalDate}
              onStatus={edit.setAnswerStatus}
              onMemo={edit.setAnswerMemo}
              onAddPhotos={(itemCode, files) => void edit.addRiskPhotos(itemCode, files)}
              onRemovePhoto={edit.removeRiskPhoto}
            />
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/55">
              안전성평가가 아직 등록되지 않았습니다. 평가가 등록된 뒤에 18개 항목과 위험요소 사진을 수정할 수 있습니다.
            </p>
          )}
        </section>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            disabled={edit.saving}
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-40"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={locked}
            className="rounded-lg border border-[#00ff88]/50 bg-[#00ff88]/15 px-4 py-2 text-sm text-[#00ff88] hover:bg-[#00ff88]/25 disabled:opacity-40"
          >
            {edit.saving ? "저장 중..." : edit.busy ? "사진 준비 중..." : "저장"}
          </button>
        </div>
      </form>
    </EditDialog>
  );
}

export function RegistrationEditModal({ registrationId, onClose, onSaved }: RegistrationEditModalProps) {
  const { detail, error } = usePlaysafeAdminDetail(registrationId);

  if (error) {
    return (
      <EditDialog title="시설 수정" saving={false} onClose={onClose}>
        <p className="text-sm text-amber-200">{error}</p>
      </EditDialog>
    );
  }
  if (!detail) {
    return (
      <EditDialog title="시설 수정" saving={false} onClose={onClose}>
        <p className="text-sm text-white/60">불러오는 중...</p>
      </EditDialog>
    );
  }
  return <RegistrationEditor key={detail.registration.id} detail={detail} onClose={onClose} onSaved={onSaved} />;
}
