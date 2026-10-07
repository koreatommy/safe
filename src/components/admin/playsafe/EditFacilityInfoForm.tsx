"use client";

import { useRef, useState } from "react";
import { indoorOptions, PLACE_ETC, placeOptions, waterOptions } from "@/data/playsafe/facility-registration";
import type { FacilityManagerInfo } from "@/data/playsafe/types";
import { DAUM_POSTCODE_UNAVAILABLE, openPostcode } from "@/lib/playsafe/daumPostcode";
import { EditField, editControlClass } from "./EditField";

type EditFacilityInfoFormProps = {
  submitterName: string;
  submitterEmail: string;
  information: FacilityManagerInfo;
  onSubmitterName: (value: string) => void;
  onSubmitterEmail: (value: string) => void;
  onInformation: <K extends keyof FacilityManagerInfo>(field: K, value: FacilityManagerInfo[K]) => void;
};

function choices(options: readonly string[], current: string): readonly string[] {
  if (!current || options.includes(current)) return options;
  return [current, ...options];
}

export function EditFacilityInfoForm({
  submitterName,
  submitterEmail,
  information,
  onSubmitterName,
  onSubmitterEmail,
  onInformation,
}: EditFacilityInfoFormProps) {
  const detailRef = useRef<HTMLInputElement>(null);
  const [addressError, setAddressError] = useState("");

  const searchAddress = () => {
    setAddressError("");
    const opened = openPostcode(({ postcode, address }) => {
      onInformation("postcode", postcode);
      onInformation("address", address);
      detailRef.current?.focus();
    });
    if (!opened) setAddressError(DAUM_POSTCODE_UNAVAILABLE);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <EditField label="입력자 이름">
        <input className={editControlClass} required value={submitterName} onChange={(event) => onSubmitterName(event.target.value)} />
      </EditField>
      <EditField label="입력자 이메일">
        <input
          type="email"
          required
          className={editControlClass}
          value={submitterEmail}
          onChange={(event) => onSubmitterEmail(event.target.value)}
        />
      </EditField>
      <EditField label="시설명">
        <input
          required
          className={editControlClass}
          value={information.facilityName}
          onChange={(event) => onInformation("facilityName", event.target.value)}
        />
      </EditField>
      <EditField label="임시시설번호">
        <input className={`${editControlClass} text-white/50`} value={information.facilityNo} readOnly />
      </EditField>
      <EditField label="설치장소">
        <select
          className={editControlClass}
          value={information.place}
          onChange={(event) => onInformation("place", event.target.value)}
        >
          <option value="">선택</option>
          {choices(placeOptions, information.place).map((option) => (
            <option key={option} value={option}>
              {option === PLACE_ETC ? `${option} (직접 입력)` : option}
            </option>
          ))}
        </select>
      </EditField>
      {information.place === PLACE_ETC ? (
        <EditField label="기타 설치장소">
          <input
            className={editControlClass}
            value={information.placeEtc}
            onChange={(event) => onInformation("placeEtc", event.target.value)}
          />
        </EditField>
      ) : (
        <span className="hidden sm:block" />
      )}
      <EditField label="우편번호">
        <span className="mt-1 flex items-center gap-2">
          <input className={`${editControlClass} mt-0`} value={information.postcode} onChange={(event) => onInformation("postcode", event.target.value)} />
          <button
            type="button"
            onClick={searchAddress}
            className="shrink-0 rounded-lg border border-white/20 px-3 text-xs text-white/80 hover:bg-white/10"
          >
            주소검색
          </button>
        </span>
      </EditField>
      <EditField label="주소" className="sm:col-span-2">
        <input className={editControlClass} value={information.address} onChange={(event) => onInformation("address", event.target.value)} />
      </EditField>
      <EditField label="상세주소" className="sm:col-span-2">
        <input
          ref={detailRef}
          className={editControlClass}
          value={information.detailAddress}
          onChange={(event) => onInformation("detailAddress", event.target.value)}
        />
        {addressError ? <span className="mt-1 block text-amber-200">{addressError}</span> : null}
      </EditField>
      <EditField label="물놀이형 놀이기구">
        <select className={editControlClass} value={information.water} onChange={(event) => onInformation("water", event.target.value)}>
          <option value="">선택</option>
          {choices(waterOptions, information.water).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </EditField>
      <EditField label="실내외 구분">
        <select className={editControlClass} value={information.indoor} onChange={(event) => onInformation("indoor", event.target.value)}>
          <option value="">선택</option>
          {choices(indoorOptions, information.indoor).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </EditField>
      <EditField label="관리주체 성명">
        <input className={editControlClass} value={information.managerName} onChange={(event) => onInformation("managerName", event.target.value)} />
      </EditField>
      <EditField label="전화번호">
          <input
            inputMode="numeric"
            className={editControlClass}
            value={information.phone}
            onChange={(event) => onInformation("phone", event.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
          />
      </EditField>
      <EditField label="관리주체 이메일" className="sm:col-span-2">
        <input
          type="email"
          className={editControlClass}
          value={information.email}
          onChange={(event) => onInformation("email", event.target.value)}
        />
      </EditField>
    </div>
  );
}
