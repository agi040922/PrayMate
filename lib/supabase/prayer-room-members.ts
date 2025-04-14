import { supabase } from '@/lib/supabaseClient'
import { PrayerRequest } from '@/components/features/reports/PrayerSelection'

// 사용자 타입 정의
interface User {
  user_id: string;
  name?: string;
  email: string;
}

// 기도제목 DB 항목 타입
interface PrayerRequestDB {
  request_id: string;
  title: string;
  content: string;
  bible_verse?: string;
  category_id: number;
  created_at: string;
  is_answered: boolean;
  user_id: string;
  user?: {
    user_id: string;
    name: string;
    email: string;
  };
}

// 기도 응답 타입
interface PrayerAnswer {
  answer_id: string;
  request_id: string;
  content: string;
  answered_at: string;
}

// 카테고리 타입
interface Category {
  category_id: number;
  name: string;
  description: string;
}

// 사용자가 속한 기도방 목록 가져오기
export async function getUserPrayerRooms(userId: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .select('room_id')
    .eq('user_id', userId)

  if (error) throw error
  return data.map(item => item.room_id)
}

// 특정 기도방 정보 가져오기
export async function getPrayerRoomInfo(roomId: string) {
  const { data, error } = await supabase
    .from('prayer_rooms')
    .select('*')
    .eq('room_id', roomId)
    .single()

  if (error) throw error
  return data
}

// 기도방 구성원 목록 가져오기
export async function getPrayerRoomMembers(roomId: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .select(`
      user_id,
      users:user_id (
        user_id,
        name,
        email
      )
    `)
    .eq('room_id', roomId)

  if (error) throw error
  
  // 데이터를 User[] 배열로 변환
  return data.map(item => ({
    user_id: item.user_id,
    name: item.users?.name,
    email: item.users?.email
  })) as User[]
}

// 카테고리 목록 가져오기
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
  
  if (error) throw error
  return data as Category[]
}

// 특정 기도방의 모든 구성원들의 기도제목 가져오기
export async function getRoomMembersPrayerRequests(roomId: string, options?: {
  category?: string,
  period?: 'weekly' | 'monthly' | 'yearly' | 'all',
  is_answered?: boolean
}) {
  // 1. 해당 기도방의 멤버 ID 목록 가져오기
  const members = await getPrayerRoomMembers(roomId)
  const memberIds = members.map(member => member.user_id)
  
  // 2. 카테고리 ID 가져오기 (필요한 경우)
  let categoryId: number | undefined = undefined
  if (options?.category && options.category !== 'all') {
    const categories = await getCategories()
    const category = categories.find(c => c.name === options.category)
    if (category) {
      categoryId = category.category_id
    }
  }

  // 3. 날짜 필터 계산
  let dateFilter = null
  if (options?.period && options.period !== 'all') {
    const now = new Date()
    if (options.period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = weekAgo.toISOString()
    } else if (options.period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = monthAgo.toISOString()
    } else if (options.period === 'yearly') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      dateFilter = yearAgo.toISOString()
    }
  }

  // 4. 기도제목 쿼리 구성
  let query = supabase
    .from('prayer_requests')
    .select(`
      request_id,
      title,
      content,
      bible_verse,
      category_id,
      created_at,
      is_answered,
      user_id,
      users:user_id (
        name,
        email
      )
    `)
    .in('user_id', memberIds)
    
  // 카테고리 필터 적용
  if (categoryId !== undefined) {
    query = query.eq('category_id', categoryId)
  }
  
  // 응답 여부 필터 적용
  if (options?.is_answered !== undefined) {
    query = query.eq('is_answered', options.is_answered)
  }
  
  // 날짜 필터 적용
  if (dateFilter) {
    query = query.gte('created_at', dateFilter)
  }
  
  // 정렬 (최신순)
  query = query.order('created_at', { ascending: false })
  
  // 쿼리 실행
  const { data: prayerData, error: prayerError } = await query
  
  if (prayerError) throw prayerError
  
  // 5. 응답된 기도제목의 응답 내용 가져오기
  const answeredRequestIds = prayerData
    .filter(item => item.is_answered)
    .map(item => item.request_id)
  
  const { data: answerData, error: answerError } = answeredRequestIds.length > 0 
    ? await supabase
        .from('prayer_answers')
        .select('*')
        .in('request_id', answeredRequestIds)
    : { data: [], error: null }
  
  if (answerError) throw answerError
  
  // 6. 카테고리 정보 가져오기
  const categoryIds = [...new Set(prayerData.map(item => item.category_id))]
  const { data: categoriesData, error: categoriesError } = categoryIds.length > 0
    ? await supabase
        .from('categories')
        .select('*')
        .in('category_id', categoryIds)
    : { data: [], error: null }
  
  if (categoriesError) throw categoriesError
  
  // 7. 결과 변환
  return prayerData.map(item => {
    // 응답 내용 찾기
    const answer = answerData.find(a => a.request_id === item.request_id)
    
    // 카테고리 찾기
    const category = categoriesData.find(c => c.category_id === item.category_id)
    
    return {
      id: item.request_id,
      title: item.title,
      content: item.content,
      bibleVerse: item.bible_verse,
      author: item.users?.name || '알 수 없음',
      authorId: item.user_id,
      category: category?.name || 'unknown',
      date: new Date(item.created_at).toISOString().split('T')[0],
      status: item.is_answered ? "answered" : "praying",
      response: answer?.content,
      selected: false
    } as PrayerRequest
  })
}

// 자신이 속한 모든 기도방의 구성원 기도제목 가져오기
export async function getAllRoomMembersPrayerRequests(userId: string, options?: {
  category?: string,
  period?: 'weekly' | 'monthly' | 'yearly' | 'all',
  is_answered?: boolean
}) {
  // 1. 사용자가 속한 모든 기도방 ID 가져오기
  const roomIds = await getUserPrayerRooms(userId)
  
  // 2. 각 기도방의 구성원 기도제목 가져오기
  const allPrayerRequests: PrayerRequest[] = []
  
  for (const roomId of roomIds) {
    const roomPrayers = await getRoomMembersPrayerRequests(roomId, options)
    allPrayerRequests.push(...roomPrayers)
  }
  
  // 중복 제거 (같은 기도제목이 여러 방에서 공유되는 경우)
  const uniquePrayers = allPrayerRequests.reduce((acc, prayer) => {
    if (!acc.some(p => p.id === prayer.id)) {
      acc.push(prayer)
    }
    return acc
  }, [] as PrayerRequest[])
  
  return uniquePrayers
}

// 개인 기도노트 가져오기 (weekly, monthly, yearly)
export async function getPersonalPrayerNotes(userId: string, periodType: 'weekly' | 'monthly' | 'yearly') {
  const { data, error } = await supabase
    .from('personal_prayer_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('period_type', periodType)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// 개인 기도노트 저장하기
export async function savePersonalPrayerNote(
  userId: string, 
  periodType: 'weekly' | 'monthly' | 'yearly',
  periodLabel: string, 
  content: string
) {
  const { data, error } = await supabase
    .from('personal_prayer_notes')
    .insert([{
      user_id: userId,
      period_type: periodType,
      period_label: periodLabel,
      content: content,
      is_completed: false
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

// 특정 기간의 개인 기도노트 업데이트
export async function updatePersonalPrayerNote(
  noteId: string, 
  content: string, 
  isCompleted?: boolean
) {
  const updateData: any = { content }
  if (isCompleted !== undefined) {
    updateData.is_completed = isCompleted
  }
  
  const { data, error } = await supabase
    .from('personal_prayer_notes')
    .update(updateData)
    .eq('note_id', noteId)
    .select()
  
  if (error) throw error
  return data[0]
} 