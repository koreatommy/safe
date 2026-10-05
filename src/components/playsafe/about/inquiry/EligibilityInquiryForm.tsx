"use client";

import { INQUIRY_LIMITS } from "@/lib/eligibility-inquiry/constants";
import { InquiryFileField } from "./InquiryFileField";
import { useEligibilityInquiryForm } from "./useEligibilityInquiryForm";
import "./inquiry-form.css";

export function EligibilityInquiryForm() {
  const { fields, files, status, error, setField, addFiles, removeFile, onSubmit, reset } = useEligibilityInquiryForm();
  const busy = status === "submitting";

  if (status === "success") {
    return (
      <div className="inquiry-box inquiry-done" role="status">
        <strong>문의가 접수되었습니다.</strong>
        <p>검토 후 입력하신 이메일 또는 연락처로 답변드리겠습니다.</p>
        <button type="button" className="btn" onClick={reset}>
          추가 문의하기
        </button>
      </div>
    );
  }

  return (
    <form className="inquiry-box" onSubmit={onSubmit} noValidate aria-labelledby="inquiry-title">
      <h4 id="inquiry-title">대상 여부 문의하기</h4>
      <p className="inquiry-lead">신종·유사놀이시설 대상여부가 궁금하신 분은 아래 입력폼을 입력해서 보내주세요.</p>

      <label className="inquiry-label" htmlFor="inquiry-subject">제목</label>
      <input
        id="inquiry-subject"
        className="field"
        value={fields.title}
        maxLength={INQUIRY_LIMITS.title}
        onChange={(e) => setField("title", e.target.value)}
        placeholder="예) 무인 키즈카페 볼풀 시설 대상 여부"
        required
      />

      <label className="inquiry-label" htmlFor="inquiry-content">문의 내용</label>
      <textarea
        id="inquiry-content"
        rows={5}
        value={fields.content}
        maxLength={INQUIRY_LIMITS.content}
        onChange={(e) => setField("content", e.target.value)}
        placeholder="시설 유형, 설치된 놀이기구·구조물, 운영 방식 등을 적어주세요."
        required
      />

      <div className="inquiry-grid">
        <div>
          <label className="inquiry-label" htmlFor="inquiry-name">이름</label>
          <input id="inquiry-name" className="field" autoComplete="name" value={fields.name}
            maxLength={INQUIRY_LIMITS.name} onChange={(e) => setField("name", e.target.value)} required />
        </div>
        <div>
          <label className="inquiry-label" htmlFor="inquiry-phone">연락처</label>
          <input id="inquiry-phone" className="field" type="tel" inputMode="tel" autoComplete="tel"
            value={fields.phone} maxLength={13} placeholder="010-0000-0000"
            onChange={(e) => setField("phone", e.target.value)} required />
        </div>
      </div>

      <label className="inquiry-label" htmlFor="inquiry-email">이메일</label>
      <input id="inquiry-email" className="field" type="email" autoComplete="email" value={fields.email}
        maxLength={INQUIRY_LIMITS.email} placeholder="answer@example.com"
        onChange={(e) => setField("email", e.target.value)} required />

      <InquiryFileField files={files} disabled={busy} onAdd={addFiles} onRemove={removeFile} />

      <label className="inquiry-consent">
        <input type="checkbox" checked={fields.privacyAgreed} onChange={(e) => setField("privacyAgreed", e.target.checked)} />
        <span>
          문의 답변을 위해 이름·이메일·연락처를 수집하며, 답변 완료 후 관련 법령에 따라 파기합니다. 개인정보 수집·이용에 동의합니다.
        </span>
      </label>

      {error && <p className="inquiry-error" role="alert">{error}</p>}

      <button type="submit" className="btn primary inquiry-submit" disabled={busy}>
        {busy ? "보내는 중…" : "문의 보내기"}
      </button>
    </form>
  );
}
