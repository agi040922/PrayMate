"use client"

import dynamic from "next/dynamic"

const ReportContainer = dynamic(() => import("@/components/features/reports/ReportContainer"), {
  ssr: false,
})

export default function ReportsPage() {
  return <ReportContainer />
}

// components/features/reports 디렉토리에 기도 리포트 기능 관련 컴포넌트들을 분리하여 모듈화했습니다:
// PrayerSelection.tsx: 기도제목 선택 컴포넌트
// ReportPreview.tsx: 리포트 미리보기 및 다운로드 컴포넌트
// FilterDialog.tsx: 필터 설정 다이얼로그 컴포넌트
// ReportContainer.tsx: 모든 컴포넌트를 통합하여 상태 관리를 담당하는 컨테이너

// lib/supabase/prayer-room-members.ts 파일에 자신이 속한 방 사람들의 개인 기도제목을 가져오는 데이터 로직을 구현했습니다:
// getUserPrayerRooms: 사용자가 속한 기도방 ID 목록을 가져옵니다.
// getPrayerRoomMembers: 특정 기도방의 구성원 목록을 가져옵니다.
// getRoomMembersPrayerRequests: 특정 기도방의 모든 구성원들의 기도제목을 가져옵니다.
// getAllRoomMembersPrayerRequests: 자신이 속한 모든 기도방의 구성원 기도제목을 가져옵니다.
// getPersonalPrayerNotes: 기간별(주간/월간/연간) 개인 기도노트를 가져옵니다.
// ReportContainer.tsx에 실제 Supabase 연동 코드를 구현했습니다. 현재는 개발용으로 샘플 데이터를 사용하고 있지만, 실제 데이터로 전환하는 방법을 주석으로 표시해 두었습니다.