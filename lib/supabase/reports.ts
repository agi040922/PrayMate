import { supabase } from "@/lib/supabaseClient"
import { Database } from '@/types/supabase'

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
  isPersonalNote?: boolean
  periodType?: "weekly" | "monthly" | "yearly"
  periodLabel?: string
}

// 개인 기간별 기도제목 타입
export interface PersonalPrayerNote {
  note_id: string
  user_id: string
  period_type: "weekly" | "monthly" | "yearly"
  period_label: string
  content: string
  is_completed: boolean
  created_at?: string
  is_public?: boolean
  users?: { name: string } | null
  user_name?: string
}

// 필터링 옵션 인터페이스
export interface ReportFilterOptions {
  roomId?: string | 'all'
  memberId?: string | 'all' | 'selected'
  memberIds?: string[]
  period: "all" | "weekly" | "monthly" | "yearly"
  category: string | 'all'
  onlyPeriodPrayers?: boolean // 기간별 기도제목만 볼지 여부
}

/**
 * 필터링에 사용할 사용자의 기도방 목록 조회 (간략 정보)
 */
export async function getUserPrayerRoomsForFilter(userId: string): Promise<{ room_id: string; title: string }[]> {
  const { data, error } = await supabase
    .from('room_participants')
    .select('prayer_rooms(room_id, title)')
    .eq('user_id', userId)

  if (error) {
    console.error("Error fetching user prayer rooms for filter:", error)
    throw error
  }

  // 중첩된 구조 해제 및 타입 변환
  const rooms: { room_id: string; title: string }[] = []
  
  data.forEach(item => {
    if (item.prayer_rooms) {
      rooms.push({
        room_id: item.prayer_rooms.room_id,
        title: item.prayer_rooms.title
      })
    }
  })

  return rooms
}

/**
 * 필터링에 사용할 특정 기도방의 멤버 목록 조회 (간략 정보)
 */
export async function getRoomMembersForFilter(roomId: string): Promise<{ user_id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('room_participants')
    .select('users(user_id, name)')
    .eq('room_id', roomId)

  if (error) {
    console.error("Error fetching room members for filter:", error)
    throw error
  }

  // 중첩된 구조 해제 및 타입 변환
  const members: { user_id: string; name: string }[] = []
  
  data.forEach(item => {
    if (item.users) {
      members.push({
        user_id: item.users.user_id,
        name: item.users.name || '이름 없음'
      })
    }
  })

  return members
}

/**
 * 필터링된 기도제목 목록 조회
 */
export async function getFilteredPrayerRequests(
  userId: string,
  options: ReportFilterOptions
): Promise<PrayerRequest[]> {
  // 기간별 기도제목만 볼 경우 해당 함수에서 처리
  if (options.onlyPeriodPrayers) {
    return getFilteredPeriodPrayers(userId, options)
  }

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
  if (options.memberId === 'selected' && options.memberIds && options.memberIds.length > 0) {
    // 선택된 멤버들의 기도제목 조회
    query = query.in('user_id', options.memberIds)
  } else if (options.memberId && options.memberId !== 'all' && options.memberId !== 'selected') {
    // 단일 멤버의 기도제목 조회
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
    category: item.categories?.name || '기타',
    date: new Date(item.created_at).toISOString().split('T')[0],
    status: item.is_answered ? 'answered' : 'praying',
    response: undefined, // 응답 내용 (필요 시 별도 쿼리 필요)
    selected: false,
    isPersonalNote: false
  }))

  return formattedData
}

/**
 * 기간별 기도제목만 필터링해서 가져오는 함수
 */
export async function getFilteredPeriodPrayers(
  userId: string,
  options: ReportFilterOptions
): Promise<PrayerRequest[]> {
  // 자신의 기간별 기도제목 가져오기
  const myPeriodPrayers = await getPersonalPrayerNotesForReport(userId, {
    period: options.period,
    periodType: 'all', // 모든 유형(주간/월간/연간) 가져오기
    onlyMine: true
  });

  // 다른 사람들의 기간별 기도제목 가져오기
  let othersPeriodPrayers: PersonalPrayerNote[] = [];
  
  // 특정 기도방 선택 시 해당 방의 구성원들의 기도제목 가져오기
  if (options.roomId && options.roomId !== 'all') {
    let memberFilter: string[] = [];
    
    // 선택된 멤버가 있는 경우
    if (options.memberId === 'selected' && options.memberIds && options.memberIds.length > 0) {
      memberFilter = options.memberIds;
    }
    // 특정 멤버 선택한 경우
    else if (options.memberId && options.memberId !== 'all' && options.memberId !== 'selected') {
      memberFilter = [options.memberId];
    }
    
    othersPeriodPrayers = await getPersonalPrayerNotesForReport(userId, {
      period: options.period,
      periodType: 'all', // 모든 유형(주간/월간/연간) 가져오기
      roomId: options.roomId,
      memberIds: memberFilter.length > 0 ? memberFilter : undefined,
      onlyMine: false
    });
  }
  
  // 개인 기도제목 PrayerRequest 형태로 변환
  const myFormattedPrayers: PrayerRequest[] = myPeriodPrayers.map((note: PersonalPrayerNote) => ({
    id: note.note_id,
    title: `[내 ${note.period_type === 'weekly' ? '주간' : note.period_type === 'monthly' ? '월간' : '연간'}] ${note.content.substring(0, 30)}${note.content.length > 30 ? '...' : ''}`,
    content: note.content,
    author: '나',
    authorId: userId,
    category: '개인',
    date: new Date(note.created_at || '').toISOString().split('T')[0],
    status: note.is_completed ? 'answered' : 'praying',
    selected: false,
    isPersonalNote: true,
    periodType: note.period_type,
    periodLabel: note.period_label
  }));
  
  // 다른 사람들의 기도제목 PrayerRequest 형태로 변환
  const othersFormattedPrayers: PrayerRequest[] = othersPeriodPrayers.map((note: PersonalPrayerNote) => ({
    id: note.note_id,
    title: `[${note.user_name || '익명'} - ${note.period_type === 'weekly' ? '주간' : note.period_type === 'monthly' ? '월간' : '연간'}] ${note.content.substring(0, 30)}${note.content.length > 30 ? '...' : ''}`,
    content: note.content,
    author: note.user_name || '익명',
    authorId: note.user_id,
    category: '기간별',
    date: new Date(note.created_at || '').toISOString().split('T')[0],
    status: note.is_completed ? 'answered' : 'praying',
    selected: false,
    isPersonalNote: true,
    periodType: note.period_type,
    periodLabel: note.period_label
  }));

  // 모든 기도제목 합치기 (내 기도제목 제외, 다른 사람의 기도제목만 반환)
  return othersFormattedPrayers;
}

/**
 * 개인 기간별 기도제목 조회 (자신 및 다른 사용자의 기도제목 포함 가능)
 */
export async function getPersonalPrayerNotesForReport(
  userId: string,
  options: {
    period: "all" | "weekly" | "monthly" | "yearly"
    periodType?: "all" | "weekly" | "monthly" | "yearly"
    roomId?: string
    memberIds?: string[]
    onlyMine?: boolean // true면 자신의 기도제목만, false면 다른 사람 것도 포함
  }
): Promise<PersonalPrayerNote[]> {
  let query;
  
  // 자신의 기도제목만 가져오는 경우
  if (options.onlyMine) {
    query = supabase
      .from('personal_prayer_notes')
      .select('*')
      .eq('user_id', userId);
  } 
  // 특정 방의 기도제목 가져오는 경우 (다른 사람 것도 포함)
  else if (options.roomId) {
    // 사용자 정보를 같이 가져오기 위해 조인
    query = supabase
      .from('personal_prayer_notes')
      .select(`
        note_id,
        user_id,
        period_type,
        period_label,
        content, 
        is_completed,
        created_at,
        is_public,
        users (
          name
        )
      `);
    
    // 방 참여자 정보 가져오기
    const { data: participants, error: participantsError } = await supabase
      .from('room_participants')
      .select('user_id')
      .eq('room_id', options.roomId);
    
    if (participantsError) {
      console.error("Error fetching room participants:", participantsError);
      throw participantsError;
    }
    
    // 방 참여자 ID 목록
    const participantIds = participants.map(p => p.user_id);
    
    // 특정 멤버만 필터링하는 경우
    if (options.memberIds && options.memberIds.length > 0) {
      const validMemberIds = options.memberIds.filter(id => participantIds.includes(id));
      query = query.in('user_id', validMemberIds);
    } else {
      // 모든 방 참여자의 기도제목
      query = query.in('user_id', participantIds);
    }
    
    // 공개된 기도제목만 가져오기 (자신의 것은 모두 가져오기)
    query = query.or(`user_id.eq.${userId},is_public.eq.true`);
  } else {
    // 기본 쿼리
    query = supabase
      .from('personal_prayer_notes')
      .select('*');
  }
  
  // 특정 기간 타입 필터링 (주간/월간/연간)
  if (options.periodType && options.periodType !== 'all') {
    query = query.eq('period_type', options.periodType);
  }
  
  // 기간으로 필터링 (최근 주간, 월간, 연간)
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
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching personal prayer notes:", error);
    throw error;
  }
  
  // 사용자 이름 추가
  return data.map(note => ({
    ...note,
    user_name: note.users?.name || null
  }));
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