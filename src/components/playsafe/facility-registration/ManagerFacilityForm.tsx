"use client";

import { useRef } from "react";
import { indoorOptions, waterOptions } from "@/data/playsafe/facility-registration";
import type { FacilityManagerInfo, FacilityPhoto } from "@/data/playsafe/types";
import { DAUM_POSTCODE_UNAVAILABLE, openPostcode } from "@/lib/playsafe/daumPostcode";
import { FacilityPhotoField } from "./FacilityPhotoField";
import { PlaceSelectField } from "./PlaceSelectField";

export const FACILITY_FORM_ID = "facility-manager-form";

type ManagerFacilityFormProps = {
  info: FacilityManagerInfo;
  photos: FacilityPhoto[];
  consented: boolean;
  onConsent: (checked: boolean) => void;
  onChange: <K extends keyof FacilityManagerInfo>(field: K, value: FacilityManagerInfo[K]) => void;
  onPhotosChange: (photos: FacilityPhoto[]) => void;
  onNext: () => void;
  onToast: (message: string) => void;
};

export function ManagerFacilityForm({
  info,
  photos,
  consented,
  onConsent,
  onChange,
  onPhotosChange,
  onNext,
  onToast,
}: ManagerFacilityFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const searchAddress = () => {
    const opened = openPostcode(({ postcode, address }) => {
      onChange("postcode", postcode);
      onChange("address", address);
      detailRef.current?.focus();
    });
    if (!opened) onToast(DAUM_POSTCODE_UNAVAILABLE);
  };

  return (
    <form
      ref={formRef}
      id={FACILITY_FORM_ID}
      className="facility-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (formRef.current?.reportValidity()) onNext();
      }}
    >
      <div className="facility-form-block">
        <h3>신종·유사 놀이시설 정보</h3>
        <div className="facility-grid">
          <label className="facility-field">
            시설명
            <input
              type="text"
              required
              value={info.facilityName}
              placeholder="시설명을 입력하세요"
              onChange={(event) => onChange("facilityName", event.target.value)}
            />
          </label>
          <label className="facility-field">
            임시시설번호
            <input type="text" value={info.facilityNo} placeholder="저장 시 자동 부여" readOnly tabIndex={-1} />
            <p className="facility-hint">신규설치 등록신청을 저장하면 고유번호가 자동으로 부여됩니다.</p>
          </label>
          <PlaceSelectField
            place={info.place}
            placeEtc={info.placeEtc}
            onPlaceChange={(value) => onChange("place", value)}
            onPlaceEtcChange={(value) => onChange("placeEtc", value)}
          />
          <FacilityPhotoField photos={photos} onChange={onPhotosChange} />
          <div className="facility-field facility-field-full">
            <span>주소</span>
            <div className="facility-address">
              <div className="facility-address-search">
                <input value={info.postcode} placeholder="우편번호" readOnly />
                <button type="button" className="btn" onClick={searchAddress}>
                  주소검색
                </button>
              </div>
              <input value={info.address} placeholder="도로명 주소" readOnly />
              <input
                ref={detailRef}
                value={info.detailAddress}
                placeholder="상세주소를 입력하세요"
                onChange={(event) => onChange("detailAddress", event.target.value)}
              />
            </div>
            <p className="facility-hint">한국 주소검색을 통해 도로명 주소를 입력합니다.</p>
          </div>
          <label className="facility-field">
            물놀이형 놀이기구
            <select value={info.water} onChange={(event) => onChange("water", event.target.value)}>
              <option value="">선택</option>
              {waterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="facility-field">
            실내외 구분
            <select value={info.indoor} onChange={(event) => onChange("indoor", event.target.value)}>
              <option value="">선택</option>
              {indoorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="facility-form-block">
        <h3>관리주체 정보</h3>
        <div className="facility-grid">
          <label className="facility-field">
            관리주체 성명
            <input
              type="text"
              value={info.managerName}
              placeholder="성명을 입력하세요"
              onChange={(event) => onChange("managerName", event.target.value)}
            />
          </label>
          <label className="facility-field">
            전화번호
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              value={info.phone}
              placeholder="숫자만 입력하세요"
              onChange={(event) => onChange("phone", event.target.value.replace(/[^0-9]/g, ""))}
            />
          </label>
          <label className="facility-field">
            이메일
            <input
              type="email"
              value={info.email}
              placeholder="example@email.com"
              onChange={(event) => onChange("email", event.target.value)}
            />
          </label>
        </div>
      </div>

      <label className="facility-consent">
        <input type="checkbox" required checked={consented} onChange={(event) => onConsent(event.target.checked)} />
        <span>시설·담당자 정보를 안전성평가 진행을 위해 저장하는 데 동의합니다.</span>
      </label>

      <div className="facility-actions">
        <button type="submit" className="btn primary">
          입력 확인 · 다음 항목으로
        </button>
      </div>
    </form>
  );
}
