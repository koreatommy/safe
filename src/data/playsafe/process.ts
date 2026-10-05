import type { ProcedureRow, ProcessStep, ScheduleItem } from "./types";

export const processSteps: ProcessStep[] = [
  {
    title: "위험요소 식별",
    description: "설치물과 공간별 놀이기능을 파악하고, 예상되는 사고유형과 심각한 부상으로 이어질 위험을 찾습니다. 사용연령·인원 미준수 등 오용도 고려합니다.",
    tag: "놀이 관찰 → 사고위험 파악",
  },
  {
    title: "위험요소 저감",
    description: "시설 보완·장애물 이동·접근 차단 등 기술적 조치와 이용연령·수심·안전수칙 안내 등 관리적 조치를 함께 실행합니다.",
    tag: "시설 개선 + 이용 안내",
  },
  {
    title: "관리 및 재검토",
    description: "평가결과를 이용자와 보호자에게 게시하고, 위험을 지속적으로 관찰합니다. 위험이 관리 가능한 수준이 될 때까지 평가와 개선을 반복합니다.",
    tag: "결과 공유 → 모니터링",
  },
];

export const scheduleItems: ScheduleItem[] = [
  { title: "이용개시 전", description: "설치 후 최초 평가 및 위험요소 제거" },
  { title: "운영 중 월 1회 이상", description: "정기 평가와 개선상태 확인" },
  { title: "환경 변화·사고 발생 시", description: "공간·구조 변화에 맞춘 추가 평가" },
];

export const procedureRows: ProcedureRow[] = [
  { stage: "설치", content: "어린이놀이시설 해당 여부 확인", note: "해당 시 기존 법령의 안전관리 절차 적용" },
  { stage: "설치", content: "시설 신고·등록 / 설치자", badge: "2027. 2. 28. 시행", note: "관할 시·군·구 신고" },
  { stage: "설치", content: "어린이활동공간 검사 / 설치자", note: "환경보건법상 대상 여부 별도 확인" },
  { stage: "설치", content: "설치 시 안전성평가 / 설치자", note: "이용개시 전 실시" },
  { stage: "운영", content: "안전관리자 지정 / 관리주체", note: "별도 임명하지 않으면 관리주체가 담당" },
  { stage: "운영", content: "안전교육 / 안전관리자", note: "2025년 가이드라인에는 향후 도입 예정으로 기재. 시행 세부사항은 별도 확인" },
  { stage: "운영", content: "사고배상 책임보험 가입", badge: "2027. 2. 28.부터 의무", note: "개정 안내 참조" },
  { stage: "운영", content: "중대한 사고 보고", badge: "2027. 2. 28.부터 의무", note: "개정 안내 참조" },
  { stage: "운영", content: "월 1회 이상 안전성평가", badge: "2027. 2. 28.부터 의무", note: "평가 결과 기록·보관" },
];
