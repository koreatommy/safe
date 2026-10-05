export interface Question {
  id: number;
  type: 'multiple' | 'ox';
  difficulty: 'medium-high' | 'high';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const questions: Question[] = [
  {
    id: 1,
    type: 'multiple',
    difficulty: 'medium-high',
    question: '관리주체가 새로운 안전관리자를 선임하거나 변경 배치한 경우, 해당 안전관리자가 신규 안전교육을 이수해야 하는 법적 기한으로 옳은 것은?',
    options: [
      '배치한 날부터 15일 이내',
      '인도받은 날부터 1개월 이내',
      '인도받거나 변경된 날부터 3개월 이내',
      '교육 유효기간 만료 전 6개월 이내'
    ],
    correctAnswer: 2,
    explanation: '어린이놀이시설 안전관리법에 따르면, 안전관리자는 인도받거나 변경된 날부터 3개월 이내에 신규 안전교육을 이수해야 합니다.'
  },
  {
    id: 2,
    type: 'ox',
    difficulty: 'medium-high',
    question: '안전관리자는 설치된 어린이놀이시설의 기능 및 안전성 유지를 위해 월 1회 이상 자체 안전점검을 실시해야 하며, 그 결과(점검대장)를 최종 기재일부터 3년간 보관해야 한다.',
    options: ['O', 'X'],
    correctAnswer: 0,
    explanation: '안전점검은 월 1회 이상 의무이며, 점검실시대장은 최종 기재일부터 3년간 보관해야 합니다.'
  },
  {
    id: 3,
    type: 'multiple',
    difficulty: 'medium-high',
    question: '관리주체가 안전관리자를 지정(배치)한 후, 어린이놀이시설 안전관리시스템을 통해 관리감독기관의 장에게 그 사실을 통보해야 하는 기한은?',
    options: [
      '지정한 날부터 즉시',
      '지정된 날부터 15일 이내',
      '지정된 날부터 30일 이내',
      '안전교육을 이수한 후 7일 이내'
    ],
    correctAnswer: 1,
    explanation: '관리주체는 안전관리자를 지정한 날부터 15일 이내에 관리감독기관에 통보해야 합니다.'
  },
  {
    id: 4,
    type: 'ox',
    difficulty: 'medium-high',
    question: '어린이놀이시설 안전관리법상 안전관리자는 반드시 별도의 기술 자격증(예: 시설물관리사 등)을 보유한 자만 지정될 수 있다.',
    options: ['O', 'X'],
    correctAnswer: 1,
    explanation: '안전관리자 지정을 위한 별도의 자격 요건은 없습니다. 다만, 실제 안전관리 업무를 수행할 수 있는 사람이어야 합니다.'
  },
  {
    id: 5,
    type: 'multiple',
    difficulty: 'high',
    question: '다음 중 「어린이놀이시설 안전관리법 시행령」에서 정의하는 \'중대사고\'의 범위에 해당하지 않는 것은?',
    options: [
      '사고 발생일로부터 7일 이내에 48시간 이상의 입원치료가 필요한 경우',
      '골절상(치아 골절 포함) 또는 내장이 손상된 경우',
      '동일한 사고로 인해 2명이 동시에 부상을 당한 경우',
      '부상 면적이 신체 표면의 5% 이상이거나 2도 이상의 화상을 입은 경우'
    ],
    correctAnswer: 2,
    explanation: '중대사고 중 부상의 경우 \'3명 이상\'이 동시에 부상을 당해야 해당합니다. 2명은 중대사고 기준에 미달합니다.'
  },
  {
    id: 6,
    type: 'ox',
    difficulty: 'high',
    question: '안전검사(설치·정기시설검사)에 불합격한 어린이놀이시설에 대하여 이용금지 조치를 하지 않고 어린이가 이용하도록 방치한 관리주체는 1년 이하의 징역 또는 1천만원 이하의 벌금에 처해질 수 있다.',
    options: ['O', 'X'],
    correctAnswer: 0,
    explanation: '법 제13조 위반 시 제29조 벌칙 규정에 따라 1년 이하의 징역 또는 1천만원 이하의 벌금에 처해질 수 있습니다.'
  },
  {
    id: 7,
    type: 'multiple',
    difficulty: 'high',
    question: '안전관리자의 안전교육 면제 및 효력에 관한 설명 중 옳은 것은?',
    options: [
      '안전관리자가 다른 시설로 이직하면 이전 시설에서 받은 교육 효력은 소멸한다.',
      '안전관리 교육의 유효기간은 이수한 날부터 3년이다.',
      '\'우수 어린이놀이시설\'로 지정된 시설의 안전관리자는 1회에 한하여 안전교육이 면제된다.',
      '안전점검을 대리하는 자는 반드시 안전관리자와 동일한 안전교육을 받아야 한다.'
    ],
    correctAnswer: 2,
    explanation: '우수 어린이놀이시설로 지정된 시설의 안전관리자는 1회에 한하여 안전교육이 면제됩니다. 교육의 유효기간은 2년입니다.'
  },
  {
    id: 8,
    type: 'ox',
    difficulty: 'high',
    question: '물놀이형 어린이놀이시설을 운영하는 경우, 안전관리자가 현장에 상주하고 있다면 별도의 자격을 갖춘 \'안전요원\'을 배치하지 않아도 법적 의무를 다한 것으로 본다.',
    options: ['O', 'X'],
    correctAnswer: 1,
    explanation: '안전관리자와 별개로, 물을 가동하는 기간에는 자격 요건을 갖춘 안전요원을 반드시 현장에 상주 배치해야 합니다. 미배치 시 500만원 이하의 과태료가 부과됩니다.'
  },
  {
    id: 9,
    type: 'multiple',
    difficulty: 'high',
    question: '어린이놀이시설 정기시설검사 및 불합격 시설 조치에 관한 설명으로 틀린 것은?',
    options: [
      '정기시설검사는 2년에 1회 이상 안전검사기관으로부터 받아야 한다.',
      '불합격 통보를 받은 관리주체는 6개월 이내에 시설개선계획서를 제출해야 한다.',
      '불합격 판정 시 놀이터 내 일부 기구가 아닌 전체 시설에 대해 이용금지 조치를 취해야 한다.',
      '검사 결과에 이의가 있는 경우 통보받은 날부터 15일 이내에 재검사를 신청할 수 있다.'
    ],
    correctAnswer: 1,
    explanation: '시설개선계획서는 불합격 통보를 받은 날부터 \'2개월 이내\'에 제출해야 합니다. 6개월이 아닙니다.'
  },
  {
    id: 10,
    type: 'multiple',
    difficulty: 'high',
    question: '어린이놀이시설 사고배상책임보험 가입 의무에 관한 설명 중 옳은 것은?',
    options: [
      '보험은 반드시 설치검사 합격 후에만 가입할 수 있다.',
      '관리주체는 시설을 인도받은 날부터 30일 이내에 보험에 가입해야 한다.',
      '아파트에 거주하지 않는 외부 어린이가 사고를 당한 경우에는 보험 처리가 불가능하다.',
      '영조물배상책임보험에 가입되어 있다면 별도의 특약 없이도 모든 의무가 면제된다.'
    ],
    correctAnswer: 1,
    explanation: '관리주체는 시설을 인도받은 날부터 30일 이내에 사고배상책임보험에 가입해야 합니다.'
  }
];

export const TOTAL_QUESTIONS = questions.length;
export const POINTS_PER_QUESTION = 10;
export const MAX_SCORE = TOTAL_QUESTIONS * POINTS_PER_QUESTION;
