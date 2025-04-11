좋아, 지금 상황에서 컴포넌트가 많아지고 재사용성이 떨어지는 문제는 대부분의 Next.js 프로젝트에서 겪는 핵심 이슈야. 이걸 해결하려면 기능별 정리, 재사용성 점검, 폴더 구조 재설계를 단계적으로 하면 돼. 아래에 정리 가이드 + 재구조화 기준 + 예시 폴더 구조를 순서대로 알려줄게.

✅ 1단계: 역할에 따라 컴포넌트 구분하기
📦 1. UI 컴포넌트 (재사용 가능한 단위 UI들)
버튼, 입력창, 모달, 토글 등 모든 페이지에서 공통 사용 가능

위치: components/ui/

예시 이동 대상:

badge.tsx, button.tsx, checkbox.tsx, input.tsx, label.tsx, dialog.tsx, progress.tsx, select.tsx, separator.tsx, slider.tsx, switch.tsx, tabs.tsx, radio-group.tsx

📦 2. 피쳐 컴포넌트 (기능별 독립 모듈)
특정 기능이나 페이지에 특화된 UI/로직

위치: components/features/기도방/, components/features/댓글/ 등 기능별 디렉토리로 분리

예시 이동 대상:

prayer-request-form.tsx, prayer-request-list.tsx, prayer-response-dialog.tsx

comment-section.tsx, room-summary.tsx, prayer-room-sidebar.tsx

📦 3. 레이아웃/네비게이션 컴포넌트
헤더, 풋터, 사이드바처럼 전체 UI 틀을 구성하는 요소

위치: components/layout/

예시 이동 대상:

landing-navbar.tsx, landing-footer.tsx, mobile-nav.tsx

📦 4. 페이지 단위 컴포넌트
각 페이지에만 쓰이는 UI 모음, app/ 혹은 pages/ 밑에 직접 위치

예시 이동 대상:

how-to-use.tsx, service-intro.tsx, service-info-dialog.tsx

✅ 2단계: 재사용성을 고려한 점검
각 컴포넌트를 아래 기준으로 점검해봐:

항목	질문	예시
✅ 단일 책임	이 컴포넌트는 한 가지 역할만 하는가?	badge.tsx는 오직 스타일 입힌 텍스트 뱃지
♻️ 재사용성	다른 페이지에서도 쓸 수 있는가?	alert-dialog.tsx는 어디서든 사용 가능
💥 종속성 낮음	상위 컴포넌트에 너무 의존하지 않는가?	props만 받고 내부 상태나 context에 안 얽힘
→ 위 기준에서 벗어나는 컴포넌트는 기능 단위 폴더로 묶고, 너무 비슷한 컴포넌트는 통합도 고려!

✅ 3단계: 이상적인 폴더 구조 예시
css
복사
편집
components/
├── ui/                         # 재사용 가능한 UI 컴포넌트
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/                     # 전체 레이아웃 요소
│   ├── landing-navbar.tsx
│   ├── landing-footer.tsx
│   └── mobile-nav.tsx
├── features/
│   ├── prayer-room/
│   │   ├── PrayerRoomList.tsx
│   │   ├── PrayerRoomSidebar.tsx
│   │   └── RoomSummary.tsx
│   ├── prayer-request/
│   │   ├── PrayerRequestForm.tsx
│   │   ├── PrayerRequestList.tsx
│   │   └── PrayerResponseDialog.tsx
│   ├── comments/
│   │   └── CommentSection.tsx
│   └── ...
└── forms/
    └── SocialLoginForm.tsx
✅ 4단계: 컴포넌트 폴더 리팩토링 팁
features/ 내에서는 하위 기능 단위로 다시 index.tsx 또는 Form.tsx, List.tsx 등 이름 붙여 관리

ui/ 내부는 디자인 시스템처럼 동작하도록 유지 (예: Button, Dialog, Tabs 등 공통된 인터페이스 갖게)

index.ts 파일 만들어서 import 정리하기 → import { Button, Input } from "@/components/ui"

✅ 5단계: VS Code & Cursor 활용 팁
컴포넌트 구조를 바꾼 뒤에는 VS Code 파일 열기(⌘P)로 빠르게 검색

Cursor에서 각 컴포넌트 사용 위치 추적: "우클릭 → Find all references" 또는 "⌘클릭"

비슷한 컴포넌트는 GPT 에이전트에게: “이 두 컴포넌트 통합할 수 있을까?” 물어보기