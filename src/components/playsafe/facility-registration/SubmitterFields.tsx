"use client";

import type { Submitter } from "@/lib/playsafe-workflow/types";
import "./submitter-fields.css";

type SubmitterFieldsProps = {
  formId: string;
  submitter: Submitter;
  locked: boolean;
  onChange: (field: keyof Submitter, value: string) => void;
};

export function SubmitterFields({ formId, submitter, locked, onChange }: SubmitterFieldsProps) {
  return (
    <fieldset className="submitter-fields" aria-describedby="submitter-hint">
      <legend className="submitter-legend">정보 입력자</legend>
      <label className="submitter-field">
        <span>이름</span>
        <input
          form={formId}
          type="text"
          required
          maxLength={50}
          autoComplete="name"
          value={submitter.name}
          readOnly={locked}
          placeholder="입력자 이름"
          onChange={(event) => onChange("name", event.target.value)}
        />
      </label>
      <label className="submitter-field">
        <span>이메일</span>
        <input
          form={formId}
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={submitter.email}
          readOnly={locked}
          placeholder="example@email.com"
          onChange={(event) => onChange("email", event.target.value)}
        />
      </label>
      <p id="submitter-hint" className="submitter-hint">
        {locked
          ? "저장된 등록의 입력자 정보는 변경할 수 없습니다."
          : "이름·이메일·시설명으로 등록을 구분하며, 이어서 작성할 때 같은 정보를 입력합니다."}
      </p>
    </fieldset>
  );
}
