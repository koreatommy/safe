"use client";

import { PLACE_ETC, placeOptions } from "@/data/playsafe/facility-registration";

type PlaceSelectFieldProps = {
  place: string;
  placeEtc: string;
  onPlaceChange: (value: string) => void;
  onPlaceEtcChange: (value: string) => void;
};

export function PlaceSelectField({ place, placeEtc, onPlaceChange, onPlaceEtcChange }: PlaceSelectFieldProps) {
  const isEtc = place === PLACE_ETC;

  return (
    <>
      <label className="facility-field">
        설치장소
        <select
          value={place}
          onChange={(event) => {
            onPlaceChange(event.target.value);
            if (event.target.value !== PLACE_ETC) onPlaceEtcChange("");
          }}
        >
          <option value="">선택</option>
          {placeOptions.map((option) => (
            <option key={option} value={option}>
              {option === PLACE_ETC ? `${option} (직접 입력)` : option}
            </option>
          ))}
        </select>
      </label>
      {isEtc && (
        <label className="facility-field">
          기타 설치장소
          <input
            type="text"
            value={placeEtc}
            placeholder="설치장소를 직접 입력하세요"
            onChange={(event) => onPlaceEtcChange(event.target.value)}
          />
        </label>
      )}
    </>
  );
}
