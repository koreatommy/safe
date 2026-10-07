import Link from "next/link";
import type { ReactNode } from "react";
import { playsafeRoutes } from "@/lib/playsafe/routes";

export function RegistrationRequired({ children }: { children?: ReactNode }) {
  return (
    <div className="assessment-required" role="alert">
      <strong>시설정보 입력을 먼저 완료해 주세요.</strong>
      <p>
        안전성평가는 시설명 입력, 신규설치 판단 기준 확인, 놀이기구 1개 이상 등록 후 ‘저장’까지 마친 뒤 ‘안전성평가
        시작’ 버튼으로 진입할 수 있습니다.
      </p>
      <Link href={playsafeRoutes.facilityInfo} className="btn primary">
        시설정보입력으로 이동 →
      </Link>
      {children}
    </div>
  );
}
