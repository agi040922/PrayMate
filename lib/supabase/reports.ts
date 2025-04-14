import { supabase } from "@/lib/supabaseClient"

// 기도제목 타입 정의 (PrayerSelection 컴포넌트 타입과 호환)
export interface PrayerRequest {
  id: string
  title: string
  content: string
  bibleVerse?: string
  author: string
  authorId?: string
  category: string
  date: string
  status: "praying" | "answered" | null
  response?: string
  selected?: boolean
}

// 필터링 옵션 인터페이스
export interface ReportFilterOptions {
  roomId?: string | 'all'
  memberId?: string | 'all'
  period: "all" | "weekly" | "monthly" | "yearly"
  category: string | 'all'
}

/**
 * 필터링에 사용할 사용자의 기도방 목록 조회 (간략 정보)
 */
export async function getUserPrayerRoomsForFilter(userId: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .select('prayer_rooms(room_id, title)')
    .eq('user_id', userId)

  if (error) {
    console.error("Error fetching user prayer rooms for filter:", error)
    throw error
  }

  // 중첩된 구조 해제
  return data.map(item => item.prayer_rooms).filter(room => room !== null)
}

/**
 * 필터링에 사용할 특정 기도방의 멤버 목록 조회 (간략 정보)
 */
export async function getRoomMembersForFilter(roomId: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .select('users(user_id, name)')
    .eq('room_id', roomId)

  if (error) {
    console.error("Error fetching room members for filter:", error)
    throw error
  }

  // 중첩된 구조 해제
  return data.map(item => item.users).filter(user => user !== null)
}

/**
 * 필터링된 기도제목 목록 조회
 */
export async function getFilteredPrayerRequests(
  userId: string,
  options: ReportFilterOptions
): Promise<PrayerRequest[]> {
  let query = supabase
    .from('prayer_requests')
    .select(`
      request_id, 
      title, 
      content, 
      bible_verse, 
      created_at, 
      is_answered, 
      is_anonymous,
      room_id,
      user_id,
      categories(name),
      users(name)
    `)

  // 방 필터링
  if (options.roomId && options.roomId !== 'all') {
    query = query.eq('room_id', options.roomId)
  } else {
    // 사용자가 참여한 모든 방의 기도제목 조회
    const { data: roomIds, error: roomIdsError } = await supabase
      .from('room_participants')
      .select('room_id')
      .eq('user_id', userId)

    if (roomIdsError) {
      console.error("Error fetching user room IDs:", roomIdsError)
      throw roomIdsError
    }
    
    const participatingRoomIds = roomIds.map(r => r.room_id)
    query = query.in('room_id', participatingRoomIds)
  }

  // 멤버 필터링
  if (options.memberId && options.memberId !== 'all') {
    query = query.eq('user_id', options.memberId)
  }

  // 기간 필터링
  if (options.period !== 'all') {
    const now = new Date()
    let startDate = new Date()

    switch (options.period) {
      case 'weekly':
        startDate.setDate(now.getDate() - 7)
        break
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
    query = query.gte('created_at', startDate.toISOString())
  }

  // 카테고리 필터링
  if (options.category && options.category !== 'all') {
    // 카테고리 이름으로 필터링
    query = query.eq('categories.name', options.category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching filtered prayer requests:", error)
    throw error
  }

  // 데이터 형식 변환
  const formattedData: PrayerRequest[] = data.map((item: any) => ({
    id: item.request_id,
    title: item.title,
    content: item.content,
    bibleVerse: item.bible_verse,
    author: item.is_anonymous ? '익명' : (item.users?.name || '알 수 없음'),
    authorId: item.user_id,
    category: item.categories?.name || '미분류',
    date: new Date(item.created_at).toISOString().split('T')[0],
    status: item.is_answered ? 'answered' : 'praying',
    response: undefined, // 응답 내용 (필요 시 별도 쿼리 필요)
    selected: false
  }))

  return formattedData
}

/**
 * 개인 기도 노트를 포함한 리포트 데이터 조회
 */
export async function getPersonalPrayerNotesForReport(
  userId: string,
  options: {
    period: "all" | "weekly" | "monthly" | "yearly"
  }
) {
  let query = supabase
    .from('personal_prayer_notes')
    .select('*')
    .eq('user_id', userId)
    
  // 기간으로 필터링
  if (options.period !== 'all') {
    query = query.eq('period_type', options.period)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) {
    console.error("Error fetching personal prayer notes:", error)
    throw error
  }
  
  return data
}

/**
 * 보고서 저장 (향후 기능 확장을 위한 함수)
 */
export async function saveReport(
  userId: string,
  reportData: {
    title: string
    content: string
    filter_options: ReportFilterOptions
  }
) {
  const { data, error } = await supabase
    .from('prayer_reports')
    .insert({
      user_id: userId,
      title: reportData.title,
      content: reportData.content,
      filter_options: reportData.filter_options
    })
    .select()
  
  if (error) {
    console.error("Error saving report:", error)
    throw error
  }
  
  return data
} 