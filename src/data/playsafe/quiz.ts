import type { QuizQuestion } from "./types";

export const quizQuestions: QuizQuestion[] = [
  {
    code: "permanent-install",
    question: "영구적으로 설치·고정되어 어린이 놀이가 가능한 설비 또는 기구가 있는가?",
    hint: "이동 가능한 구조물 및 놀이용품은 제외합니다.",
    excludedReason: "영구적으로 설치·고정된 설비·기구가 없어, 이 유사 놀이기구 등록신청 판단 경로에서는 제외됩니다.",
  },
  {
    code: "not-registered-playground",
    question: "어린이놀이시설로 등록되어 있지 않은가?",
    hint: "이미 어린이놀이시설에 등록된 경우 이 안전성평가 대상에서 제외합니다.",
    excludedReason: "이미 어린이놀이시설로 등록된 기구입니다. 기존 어린이놀이시설의 안전관리 절차를 확인하세요.",
  },
  {
    code: "gravity-or-body",
    question: "중력 또는 어린이의 신체적 힘을 사용하여 놀 수 있는(물놀이 포함) 설비나 기구인가?",
    hint: "전기·전자·외부 동력을 사용하는 기구 등은 제외합니다. 테마파크시설 등에 해당할 수 있습니다.",
    excludedReason: "중력 또는 어린이의 신체적 힘을 활용하는 놀이기구가 아니므로, 이 유사 놀이기구 등록신청 판단 경로에서는 제외됩니다.",
  },
  {
    code: "play-primary-use",
    question: "어린이의 놀이 활동이 주된 용도인가?",
    hint: "놀이 외에 특정한 주된 용도가 있는 경우 제외합니다.",
    excludedReason: "어린이의 놀이 활동이 주된 용도가 아니므로, 이 유사 놀이기구 등록신청 판단 경로에서는 제외됩니다.",
  },
  {
    code: "no-ppe-required",
    question: "개인보호장비나 안전장비 없이 사용 가능한가?",
    hint: "안전장비가 필수인 레저활동 설비는 제외합니다.",
    excludedReason: "안전장비가 필수인 설비는 이 유사 놀이기구 등록신청 판단 경로에서 제외됩니다.",
  },
];
