import { supabase } from "@/lib/supabaseClient"

/**
 * 개인 기간별 기도제목 타입 정의
 */
export interface PersonalPrayerNote {
  note_id: string
  user_id: string
  period_type: "weekly" | "monthly" | "yearly"
  period_label: string // 예: '2025-W15', '2025-04', '2025'
  content: string
  is_completed?: boolean // 추가된 필드
  is_public?: boolean // 공개 여부
  created_at?: string
}

/**
 * 개인 기간별 기도제목 목록 조회
 */
export async function getPersonalPrayerNotes(
  userId: string,
  type: "weekly" | "monthly" | "yearly"
) {
  const { data, error } = await supabase
    .from("personal_prayer_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("period_type", type)
    .order("created_at", { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * 특정 기간의 개인 기도제목 목록 조회
 */
export async function getPersonalPrayerNotesByPeriod(
  userId: string,
  type: "weekly" | "monthly" | "yearly",
  periodLabel: string
) {
  const { data, error } = await supabase
    .from("personal_prayer_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("period_type", type)
    .eq("period_label", periodLabel)
    .order("created_at", { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * 현재 기간의 라벨 생성
 */
export function getCurrentPeriodLabel(type: "weekly" | "monthly" | "yearly") {
  const now = new Date()
  const year = now.getFullYear()
  
  switch (type) {
    case "yearly":
      return `${year}`
    case "monthly":
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      return `${year}-${month}`
    case "weekly":
      // 1월 1일부터 지금까지 경과한 주차 계산
      const start = new Date(year, 0, 1)
      const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
      const oneWeek = 1000 * 60 * 60 * 24 * 7
      const weekNumber = Math.floor(diff / oneWeek) + 1
      return `${year}-W${weekNumber.toString().padStart(2, '0')}`
  }
}

/**
 * 개인 기간별 기도제목 추가
 */
export async function createPersonalPrayerNote(data: {
  user_id: string
  period_type: "weekly" | "monthly" | "yearly"
  period_label?: string
  content: string
  is_public?: boolean
}) {
  const { user_id, period_type, content, is_public = true } = data
  // 기간 라벨이 없으면 현재 기간으로 설정
  const period_label = data.period_label || getCurrentPeriodLabel(period_type)
  
  const { data: note, error } = await supabase
    .from("personal_prayer_notes")
    .insert({
      user_id,
      period_type,
      period_label,
      content,
      is_completed: false,
      is_public
    })
    .select()
    .single()
  
  if (error) throw error
  return note
}

/**
 * 개인 기간별 기도제목 수정
 */
export async function updatePersonalPrayerNote(
  noteId: string,
  data: {
    content?: string
    is_completed?: boolean
    is_public?: boolean
  }
) {
  const { data: updatedNote, error } = await supabase
    .from("personal_prayer_notes")
    .update(data)
    .eq("note_id", noteId)
    .select()
    .single()
  
  if (error) throw error
  return updatedNote
}

/**
 * 개인 기간별 기도제목 완료 상태 토글
 */
export async function togglePersonalPrayerNoteCompletion(noteId: string) {
  // 1. 현재 상태 확인
  const { data: note, error: getError } = await supabase
    .from("personal_prayer_notes")
    .select("is_completed")
    .eq("note_id", noteId)
    .single()
  
  if (getError) throw getError
  
  // 2. 상태 토글
  const { data: updatedNote, error: updateError } = await supabase
    .from("personal_prayer_notes")
    .update({ is_completed: !note.is_completed })
    .eq("note_id", noteId)
    .select()
    .single()
  
  if (updateError) throw updateError
  return updatedNote
}

/**
 * 개인 기간별 기도제목 삭제
 */
export async function deletePersonalPrayerNote(noteId: string) {
  const { error } = await supabase
    .from("personal_prayer_notes")
    .delete()
    .eq("note_id", noteId)
  
  if (error) throw error
  return true
}

/**
 * 사용자의 전체 기간별 기도제목 통계 조회
 */
export async function getPersonalPrayerStatistics(userId: string) {
  const { data, error } = await supabase
    .from("personal_prayer_notes")
    .select("period_type, is_completed")
    .eq("user_id", userId)
  
  if (error) throw error
  
  const stats = {
    total: data.length,
    completed: data.filter(note => note.is_completed).length,
    weekly: {
      total: 0,
      completed: 0
    },
    monthly: {
      total: 0,
      completed: 0
    },
    yearly: {
      total: 0,
      completed: 0
    }
  }
  
  data.forEach(note => {
    const periodType = note.period_type as "weekly" | "monthly" | "yearly"
    stats[periodType].total++
    if (note.is_completed) {
      stats[periodType].completed++
    }
  })
  
  return stats
}

/**
 * 사용자의 특정 기간 유형의 기도제목 조회 (최신 1개만)
 */
export async function getPersonalPrayerNotesForPeriod(
  userId: string,
  type: "weekly" | "monthly" | "yearly"
): Promise<PersonalPrayerNote[]> {
  const { data, error } = await supabase
    .from("personal_prayer_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("period_type", type)
    .order("created_at", { ascending: false })
    .limit(10)
  
  if (error) throw error
  return data
} 