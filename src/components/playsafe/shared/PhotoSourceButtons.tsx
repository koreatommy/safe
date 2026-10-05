"use client";

import { useId, type ChangeEvent } from "react";
import "./photo-source.css";

type PhotoSourceButtonsProps = {
  disabled?: boolean;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
};

/** 모바일에서는 '사진 촬영'(후면 카메라)과 '앨범에서 선택'을 따로 보여주고, 데스크톱에서는 파일 선택만 보여준다. */
export function PhotoSourceButtons({ disabled = false, multiple = false, onFiles }: PhotoSourceButtonsProps) {
  const id = useId();
  const cameraId = `${id}-camera`;
  const albumId = `${id}-album`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length) onFiles(files);
  };

  return (
    <div className="photo-source">
      <input
        id={cameraId}
        className="photo-source-input photo-source-camera"
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled}
        onChange={handleChange}
      />
      <label htmlFor={cameraId} className="btn photo-source-btn photo-source-camera" aria-disabled={disabled}>
        사진 촬영
      </label>
      <input
        id={albumId}
        className="photo-source-input"
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
      />
      <label htmlFor={albumId} className="btn photo-source-btn" aria-disabled={disabled}>
        <span className="photo-source-label-touch">앨범에서 선택</span>
        <span className="photo-source-label-desktop">사진 선택</span>
      </label>
    </div>
  );
}
