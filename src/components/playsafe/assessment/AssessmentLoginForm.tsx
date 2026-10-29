"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { loginAssessment } from "@/lib/assessmentAuth";
import { safeAssessmentNextPath } from "@/lib/playsafe/assessmentNextPath";
import "./assessment-login.css";

export function AssessmentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    if (await loginAssessment(password)) {
      router.replace(safeAssessmentNextPath(searchParams.get("next")));
      router.refresh();
      return;
    }

    setError("비밀번호가 올바르지 않습니다.");
    setBusy(false);
  };

  return (
    <section className="assessment-login section">
      <div className="wrap assessment-login-panel">
        <p className="eyebrow">ACCESS</p>
        <h1>안전성평가 로그인</h1>
        <p className="sub">
          시설정보 입력과 안전성평가는 비밀번호 확인 후 진행할 수 있습니다.
        </p>
        <form className="assessment-login-form" onSubmit={handleSubmit}>
          <label htmlFor="assessment-password">비밀번호</label>
          <input
            id="assessment-password"
            className="field"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            autoFocus
            required
          />
          {error ? <p className="assessment-login-error" role="alert">{error}</p> : null}
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? "확인 중…" : "로그인하고 시작하기"}
          </button>
        </form>
      </div>
    </section>
  );
}
