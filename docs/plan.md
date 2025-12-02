# 신종놀이시설 안전성평가 랜딩페이지 제작 플랜

## 1. 프로젝트 설정 및 의존성 설치

### 필수 라이브러리 설치
- `framer-motion` - 애니메이션 및 인터랙션
- `@react-three/fiber` - 3D 렌더링
- `@react-three/drei` - 3D 헬퍼 유틸리티
- `three` - 3D 라이브러리

### 프로젝트 구조
```
src/
├── app/
│   ├── layout.tsx (메타데이터 업데이트)
│   ├── page.tsx (메인 랜딩페이지)
│   └── globals.css (VisionOS Glass 색상 시스템 적용)
├── components/
│   ├── ui/ (shadcn/ui 컴포넌트)
│   ├── glass/
│   │   ├── GlassPanel.tsx
│   │   ├── GlowCapsuleButton.tsx
│   │   └── FloatingSection.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── WhySection.tsx
│   │   ├── TargetSection.tsx
│   │   ├── ProcessSection.tsx
│   │   ├── ObligationSection.tsx
│   │   ├── ResultSection.tsx
│   │   ├── EducationSection.tsx
│   │   └── CTASection.tsx
│   └── three/
│       └── ReflectiveOrb.tsx
├── lib/
│   └── utils.ts (기존 유지)
└── hooks/
    └── useParallax.ts
```

## 2. 디자인 시스템 적용

### 2.1 색상 시스템 설정 ([src/app/globals.css](src/app/globals.css))
- 배경 그라데이션: `#0f121a → #1b1f2a → #0c0f18`
- Aurora 하이라이트: `#b7d7ff`, `#c4f2ff`
- Glass 표면: `rgba(255, 255, 255, 0.10)` (기본), `rgba(255, 255, 255, 0.14)` (호버)
- Glass 테두리: `rgba(255, 255, 255, 0.23)`
- Glow 효과: `rgba(150, 180, 255, 0.25)`

### 2.2 타이포그래피 설정
- Heading: Noto Sans KR, 60-96px, letter-spacing -1% to -2%
- Subheading: Noto Sans KR, 28-32px
- Body: Noto Sans KR, 18-20px
- Weight: Light(300), Regular(400), Medium(500)만 사용

## 3. 핵심 컴포넌트 구현

### 3.1 GlassPanel 컴포넌트 ([src/components/glass/GlassPanel.tsx](src/components/glass/GlassPanel.tsx))
- `backdrop-filter: blur(24px) saturate(180%)`
- `background: rgba(255,255,255,0.10)`
- `border-radius: 24px`
- `border: 1px solid rgba(255,255,255,0.23)`
- Box shadow: 외부 glow + 내부 highlight
- Framer Motion으로 부드러운 등장 애니메이션

### 3.2 GlowCapsuleButton 컴포넌트 ([src/components/glass/GlowCapsuleButton.tsx](src/components/glass/GlowCapsuleButton.tsx))
- 완전히 둥근 캡슐 형태 (full-rounded)
- Glass base + 흰색 테두리
- 호버 시 soft glow 효과
- Framer Motion hover 애니메이션

### 3.3 ReflectiveOrb 3D 컴포넌트 ([src/components/three/ReflectiveOrb.tsx](src/components/three/ReflectiveOrb.tsx))
- react-three/fiber로 반사 구체 생성
- 스크롤에 반응하는 parallax 회전
- 마우스 움직임에 반응하는 인터랙션
- 배경 Z-2 레이어에 배치

### 3.4 FloatingSection 컴포넌트 ([src/components/glass/FloatingSection.tsx](src/components/glass/FloatingSection.tsx))
- 6초 ease-in-out 무한 float 애니메이션
- 곡선형 레이아웃
- Z-layer 기반 깊이감

## 4. 섹션별 구현 계획 (PRD 기반)

### 4.1 Hero Section ([src/components/sections/HeroSection.tsx](src/components/sections/HeroSection.tsx))
**콘텐츠 (PRD 기반):**
- 메인 헤드라인: "보이지 않는 위험까지 관리하는 새로운 안전 기준, 신종놀이시설 안전성평가"
- 서브 텍스트: "아이들이 자유롭게 놀 수 있는 공간, 이제 더 안전하게 관리해야 합니다."
- 설명 문단: "급증하는 무인키즈풀·무인키즈카페·키즈펜션 등 신종 어린이 놀이공간은 기존 법령의 관리 대상이 아니어서 안전 사각지대가 되고 있습니다. 이를 해결하기 위해 정부는 신종놀이시설 안전성평가 제도를 도입하여, 다양한 형태의 놀이공간에서 발생할 수 있는 환경·관리·이용자 행동 기반 위험요소까지 포괄적으로 관리할 수 있도록 지원합니다."
- CTA 버튼: "무료 사전진단 신청", "안전성평가 의무 안내받기", "전문가 상담 요청", "안전성 평가 교육 신청"

**구현:**
- 배경에 ReflectiveOrb 3D 요소 (Z-2)
- 메인 타이틀을 GlassPanel 안에 배치 (Z-3)
- 서브 텍스트와 설명을 별도 GlassPanel로 구분
- GlowCapsuleButton으로 4개의 CTA 버튼 배치
- 3-layer depth parallax (배경, 3D 요소, 텍스트)
- Framer Motion scroll-triggered fade-in

### 4.2 Why Section ([src/components/sections/WhySection.tsx](src/components/sections/WhySection.tsx))
**콘텐츠 (PRD 섹션 1 기반):**
- 섹션 제목: "왜 지금 '안전성평가'가 필요한가요?"
- 하위 섹션 1: "기존 제도의 한계"
  - 설명: "전통적인 어린이놀이시설은 정량화된 안전기준과 법적 검사를 통해 관리되지만, 신종 놀이공간은 다음과 같은 이유로 기존 제도로 관리가 어렵습니다."
  - 항목 4가지:
    1. 놀이기구 형태가 비표준·비정형 구조물로 이루어져 있음
    2. 공간 전체가 놀이로 활용되어 위험요소가 다양함
    3. 관리 인력 부재 및 무인 운영 증가
    4. 관리자의 안전관리 역량에 따라 시설의 위험도 편차 발생
- 하위 섹션 2: "안전성평가가 해결하는 것"
  - 설명: "안전성평가는 다음 요소들을 통합적으로 점검합니다:"
  - 항목 5가지:
    1. 시설 구조물 안전성
    2. 충돌·추락·익수 등 치명적 위험
    3. 동선·환경·조명·전기 등 주변 환경
    4. 운영자 안전관리 체계
    5. 관리자의 대응 역량 및 비상조치 계획
  - 마무리 문구: "기존 검사에서 다루지 못한 정성적·종합적 위험 관리 체계를 구축하는 것이 핵심입니다."

**구현:**
- FloatingSection으로 곡선형 레이아웃
- 각 하위 섹션을 큰 GlassPanel로 구분
- 항목들을 작은 GlassPanel로 표현 (아이콘 포함)
- Scroll-triggered stagger 애니메이션
- 카드형 그리드 금지, 부드러운 곡선 배치

### 4.3 Target Section ([src/components/sections/TargetSection.tsx](src/components/sections/TargetSection.tsx))
**콘텐츠 (PRD 섹션 2 기반):**
- 섹션 제목: "안전성평가 대상 및 주요 위험요소"
- 하위 섹션 1: "평가 대상 시설"
  - 설명: "다음과 같은 시설은 모두 안전성평가 대상입니다:"
  - 항목 5가지:
    1. 무인 키즈카페 / 무인 키즈풀
    2. 키즈펜션, 키즈풀빌라, 민박·숙박형 키즈테마 공간
    3. 공산품 안전인증 대상이 아니지만 놀이 목적으로 사용되는 설비·구조물
    4. 놀이공간 내에 설치된 부가적 활용 구조물
    5. 목욕조·물놀이 욕조·수작업 고정형 구조물 등 비표준 설치물
- 하위 섹션 2: "유사 놀이기구 분류"
  - 항목 6가지: 오르는 놀이형, 건너는 놀이형, 흔들·그네형, 미끄럼형, 물놀이형, 조합형(2종 이상의 형태를 결합한 구조)
- 하위 섹션 3: "주요 위험유형 (핵심 사례 중심)"
  - 익수 위험: 수심·배수구·안전요원 부재, 감시 사각지대
  - 추락 위험: 난간 미설치, 안전공간 부족, 높이 제한 미준수
  - 감전 위험: 노출 전기설비, 습도·물기 환경의 전기 기기 비보호
  - 충돌·끼임·넘어짐: 동선 중첩, 돌출부, 바닥 미끄러움, 구조물 간 간섭
  - 마무리 문구: "이 모든 요소를 종합적으로 판단하여 위험도의 '허용 가능 수준'을 관리하는 것이 안전성평가의 핵심입니다."

**구현:**
- 위험요소를 아이콘(Lucide React)과 함께 GlassPanel로 표현
- 각 위험유형별 색상 코딩 (익수: 파란색, 추락: 빨간색, 감전: 노란색, 충돌: 주황색)
- 호버 시 glow 효과 강화
- 평가 대상 시설과 위험유형을 시각적으로 구분

### 4.4 Process Section ([src/components/sections/ProcessSection.tsx](src/components/sections/ProcessSection.tsx))
**콘텐츠 (PRD 섹션 3 기반):**
- 섹션 제목: "안전성평가 절차"
- 평가 유형 3가지:
  1. 최초 평가: "시설 설치 후 이용 개시 전 평가 필수"
  2. 정기 평가: "운영 중 월 1회 이상 자체 또는 전문기관 평가"
  3. 변경 및 사고 발생 시 평가:
     - 내부 구조 변경
     - 시설 교체
     - 안전사고 발생 시 즉시 재평가
- 평가 단계 3단계:
  1. 위험요소 식별: "구조물·현장환경·운영상황 전반을 분석"
  2. 위험 저감 조치: "기술적 보완 + 운영관리 체계 개선"
  3. 결과 등록 및 공유: "어린이놀이시설 안전관리시스템 등록 및 지속 관리"

**구현:**
- 타임라인 형태의 곡선형 레이아웃
- 각 평가 유형과 단계를 FloatingSection으로 표현
- 단계별 아이콘 및 설명
- 순차적 등장 애니메이션

### 4.5 Obligation Section ([src/components/sections/ObligationSection.tsx](src/components/sections/ObligationSection.tsx))
**콘텐츠 (PRD 섹션 4 기반):**
- 섹션 제목: "관리 주체(사업주)의 의무 및 권고사항"
- 표 데이터:
  | 관리 분야 | 주요 조치 | 의무/권고 |
  |---------|---------|---------|
  | 시설 등록 | 유사 놀이기구 시설 등록 및 시스템 정보 입력 | 법제화 예정 |
  | 안전성평가 | 월 1회 이상 평가, 결과 시스템 등록, 영업장 비치 | 권고 |
  | 보험 가입 | 어린이놀이시설 배상책임보험 가입 | **법적 의무** |
  | 안전교육 | 2년 1회, 4시간 이상 이수 및 등록 | **법적 의무** |
  | 사고 보고 | 중대한 사고 즉시 중지 및 보고 | 권고 |
- 마무리 문구: "관리자가 직접 위험을 찾고 개선하는 방식으로 운영 안전성을 높이는 제도입니다."

**구현:**
- 표를 GlassPanel 안에 배치
- 의무 항목(보험 가입, 안전교육)은 강조 색상 및 굵은 글씨 적용
- 반응형 테이블 디자인 (모바일에서는 카드 형태로 변환)
- 각 행에 hover 효과 추가

### 4.6 Result Section ([src/components/sections/ResultSection.tsx](src/components/sections/ResultSection.tsx))
**콘텐츠 (PRD 섹션 5 기반):**
- 섹션 제목: "평가 결과 활용"
- 설명: "안전성평가 결과는 어린이놀이시설 안전관리시스템에 등록"
- 등록 후 혜택 4가지:
  1. 시설 고유번호 발급
  2. 보험·안전교육·의무사항 이행 가능
  3. 안전모니터링 기록 관리
  4. 이용자에게 안전한 시설임을 인증하는 공개 자료로 활용 가능

**구현:**
- GlassPanel로 감싸서 표현
- 혜택 항목을 아이콘과 함께 나열
- 각 혜택을 작은 GlassPanel로 표현

### 4.7 Education Section ([src/components/sections/EducationSection.tsx](src/components/sections/EducationSection.tsx))
**콘텐츠 (PRD 섹션 6 기반):**
- 섹션 제목: "놀이시설 안전성평가 교육"
- 교육 개요: "신종·유사 놀이시설의 위험요소를 정확히 이해하고, 안전성평가를 통해 현장에서 즉시 적용 가능한 실무 역량을 강화하는 전문 교육 과정입니다. 모든 과정은 어린이놀이시설 안전관리 기준 및 최신 정책과 연계하여 구성되었습니다."
- 교육 일정표:
  - 일자: 09:30 ~ 17:50 (총 1일 과정)
  - 시간별 내용:
    - 09:30~10:00: 참석자 등록 및 책자 배포 (이유진)
    - 10:30~12:00: 놀이시설 안전관리 실무교육
    - 13:00~13:50: 신종·유사 놀이시설 및 놀이기구의 구분과 사례
    - 14:00~14:50: 사고위험과 위해요인의 식별 (이용자 행동특성 등) (배송수)
    - 15:00~15:50: 사고위험별 가능성과 심각성 판단 방법
    - 16:00~17:50: 위험요소 저감 조치 및 현장 지도 사례
- 교육 핵심 포인트 5가지:
  1. 신종·유사 놀이시설의 구조적·환경적 위험 이해
  2. 유형별 사고위험(추락·익수·감전·끼임 등) 분석 및 평가
  3. 실무자가 직접 적용할 수 있는 안전성평가 수행 절차
  4. 현장에서 가장 많이 발생하는 문제 사례와 대응방법
  5. 사고 예방을 위한 사전 점검·운영관리 체크리스트 제공
- 신청 접수 섹션:
  - 제목: "교육 신청하기"
  - 설명: "놀이시설 안전성평가 교육에 참여를 원하시는 분은 아래 버튼을 통해 신청서를 제출해 주십시오."
  - 신청대상 4가지:
    1. 무인키즈카페·키즈풀 운영자
    2. 키즈펜션·체험형 놀이시설 운영자
    3. 안전관리 담당자 및 종사자
    4. 신종시설 안전관리 제도 도입 예정 기관
  - 교육 혜택 4가지:
    1. 교육 수료증 발급
    2. 최신 안전성평가 체크리스트 제공
    3. 평가 준비 가이드 문서 지원
    4. 전문 강사(이유진·배송수) 현장 질의응답
  - 신청 방식:
    - 온라인 사전 접수
    - 접수 후 개별 안내 문자 발송
    - 선착순 마감
  - CTA 버튼: "지금 바로 신청하기 →"

**구현:**
- 교육 일정표를 GlassPanel 안에 표 형태로 표현
- 교육 핵심 포인트를 아이콘과 함께 나열
- 신청 섹션을 별도 GlassPanel로 구분
- "지금 바로 신청하기" GlowCapsuleButton
- 반응형 디자인 (모바일에서 일정표는 세로 스크롤)

### 4.8 CTA Section ([src/components/sections/CTASection.tsx](src/components/sections/CTASection.tsx))
**콘텐츠 (PRD 비유 섹션 기반):**
- 비유 설명:
  - 제목: "비유를 통한 쉬운 설명"
  - 내용: "신종놀이시설은 규격이 없는 '맞춤 제작 장난감'과 같습니다. 기존 시설은 인증된 장난감처럼 표준 기준이 있지만, 신종 시설은 구조가 모두 다르기 때문에 관리자가 직접 위험요소를 찾아 규칙과 안전기준을 만들어야 합니다."
  - 핵심 문구: "안전성평가는 새로운 장난감을 아이가 안전하게 쓸 수 있도록 사용 설명서를 직접 만드는 과정입니다."
- 최종 CTA 버튼들:
  - "무료 사전진단 신청"
  - "안전성평가 의무 안내받기"
  - "전문가 상담 요청"
  - "안전성 평가 교육 신청"

**구현:**
- 비유 설명을 큰 GlassPanel로 표현
- 여러 GlowCapsuleButton을 부드러운 곡선 레이아웃으로 배치
- 마지막 섹션으로 강조 효과 추가

## 5. 인터랙션 및 애니메이션

### 5.1 Parallax 효과 ([src/hooks/useParallax.ts](src/hooks/useParallax.ts))
- 마우스 움직임에 따른 부드러운 parallax
- 스크롤 깊이에 따른 3D 요소 회전
- 섹션별 fade-in 애니메이션

### 5.2 Scroll-triggered 애니메이션
- Framer Motion의 `useInView` 훅 사용
- 각 섹션이 뷰포트에 들어올 때 fade-in
- Stagger 애니메이션으로 순차적 등장

### 5.3 3D 요소 인터랙션
- ReflectiveOrb가 마우스 위치에 반응
- 스크롤에 따른 회전 애니메이션
- 배경 Z-2 레이어에 고정

## 6. 레이아웃 및 반응형

### 6.1 Z-layer 구조
- Z-1: 배경 그라데이션 및 Aurora 효과
- Z-2: 3D 요소 (ReflectiveOrb)
- Z-3: 텍스트 및 UI 컴포넌트

### 6.2 반응형 디자인
- 모바일: 단일 컬럼, 간격 축소
- 태블릿: 2컬럼 레이아웃
- 데스크톱: 넓은 간격 (48-80px), 3D 효과 강화

### 6.3 간격 규칙
- 섹션 간 간격: 80px (데스크톱), 48px (모바일)
- 컴포넌트 간 간격: 32px (데스크톱), 24px (모바일)

## 7. 메타데이터 및 SEO

### 7.1 layout.tsx 업데이트
- title: "신종놀이시설 안전성평가 | 안전한 놀이 환경을 위한 새로운 기준"
- description: "보이지 않는 위험까지 관리하는 새로운 안전 기준, 신종놀이시설 안전성평가. 무인키즈풀·무인키즈카페·키즈펜션 등 신종 어린이 놀이공간의 안전을 위한 종합적 위험 관리 체계."
- Open Graph 이미지 추가

## 8. 금지 사항 준수

- 일반적인 카드형 UI 사용 금지
- 단색 박스 사용 금지
- 기본 Tailwind 그림자 사용 금지
- 날카로운 모서리 금지 (항상 rounded)
- 평면적인 패널 금지 (항상 glass morphism)

## 9. 구현 순서

1. 의존성 설치 및 프로젝트 구조 생성
2. 디자인 시스템 (색상, 타이포그래피) 적용
3. 핵심 컴포넌트 구현 (GlassPanel, GlowCapsuleButton, ReflectiveOrb)
4. Hero Section 구현
5. 나머지 섹션 순차적 구현
6. 인터랙션 및 애니메이션 추가
7. 반응형 최적화
8. 최종 테스트 및 다듬기

