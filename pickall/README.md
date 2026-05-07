# 모두의 뽑기 (PickAll) 🎯

한국 초·중등 학원 및 교실 환경을 위해 설계된 4가지 핵심 랜덤 뽑기 도구 모음입니다. 학생 명단을 손쉽게 관리하고, 다양하고 재미있는 추첨을 통해 수업 참여도와 몰입감을 높여줍니다.

## 🌟 주요 기능 (Features)

1. **🎲 랜덤뽑기 (Random Draw)**
   - 등록된 명단에서 특정 인원 수를 무작위로 추첨합니다.
   - 단일 추첨(중복 불가), 모든 항목 순환, 중복 허용 등의 모드를 지원합니다.
   - 슬롯머신 스타일의 역동적인 애니메이션과 당첨 시 컨페티(꽃가루) 효과를 제공합니다.

2. **🔢 순서뽑기 (Order Sorting)**
   - 발표 순서, 차례 등을 무작위로 섞어서 카드 형태로 공개합니다.
   - 한 번에 모두 공개하거나 한 명씩 긴장감 있게 공개하는 모드를 지원합니다.

3. **🪑 자리뽑기 (Seating Chart)**
   - 원하는 크기(N x M)의 교실 좌석 배치도를 생성합니다.
   - 빈 자리(결석 등) 및 복도 공간을 자유롭게 설정할 수 있습니다.
   - "맨 앞자리 우선", "특정 학생간 띄어 앉기" 등 디테일한 제약 조건을 반영하여 스마트하게 좌석을 배치합니다.

4. **👥 모둠뽑기 (Group Maker)**
   - 학생들을 무작위로 N개의 조나 일정 인원 단위의 모둠으로 편성합니다.
   - **학생 메타데이터(성별, 레벨)** 를 기반으로 조별 밸런스를 맞추는 스네이크 드래프트 및 라운드 로빈 알고리즘을 지원합니다.
   - 떨어뜨리기(같은 조 금지) 및 붙여놓기(무조건 같은 조) 제약조건 설정이 가능합니다.
   - 생성된 모둠 결과를 바탕으로 조장을 자동으로 추천합니다.

## 🛠 기술 스택 (Tech Stack)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui, Lucide React
- **Animations**: Framer Motion, canvas-confetti
- **State Management**: Zustand (localStorage 영속화)
- **Data Export/Import**: SheetJS (xlsx), html2canvas

## ✨ 접근성 및 사용자 경험 강화 (UX/a11y)

- **오프라인 동작 (PWA)**: 한 번 로드된 페이지는 Service Worker를 통해 오프라인 환경(교실 내 인터넷 끊김 등)에서도 정상적으로 동작합니다.
- **애니메이션 줄이기 (Reduced Motion)**: 사용자의 기기 접근성 설정(예: 시스템 애니메이션 끄기)을 존중하여, 과도한 모션 효과를 자동으로 최소화합니다.
- **스크린 리더 친화적**: `aria-live` 및 `aria-label` 등을 적절히 배치하여 시각장애인 사용자도 추첨 결과를 소리로 인지할 수 있습니다.
- **데이터 백업**: 로컬 브라우저 기반으로 동작하므로, 언제든 우측 상단 '설정'에서 전체 데이터를 JSON 파일로 다운로드(백업)하거나 불러올 수 있습니다.

## 🚀 로컬 실행 (Getting Started)

1. 패키지 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## ☁️ 배포 (Deployment)

Vercel이나 Netlify와 같은 정적 호스팅 플랫폼에서 손쉽게 배포할 수 있습니다.

```bash
npm run build
npm run start
```

Vercel 배포 시, 일반적인 Next.js 프로젝트 설정대로 Root Directory를 `pickall` (또는 프로젝트 디렉토리)로 설정한 후 배포하면 됩니다.

---
© 2026 PickAll. Built for classrooms.
