import { supabase } from "@/lib/supabaseClient"

// 기도 요청 타입 정의
export interface PrayerRequest {
  request_id: string
  room_id: string
  category_id?: number
  user_id: string
  bible_verse?: string
  title: string
  content: string
  is_answered: boolean
  is_anonymous: boolean
  created_at?: string
}

// 카테고리 타입 정의
export interface Category {
  category_id: number
  name: string
  description?: string
}

// 기도 응답 타입 정의
export interface PrayerAnswer {
  answer_id: string
  request_id: string
  content: string
  answered_at?: string
}

// 댓글 타입 정의
export interface Comment {
  comment_id: string
  request_id: string
  user_id: string
  content: string
  created_at?: string
  user?: {
    name: string
    email: string
  }
}

// 반응 타입 정의
export interface Reaction {
  reaction_id: string
  request_id: string
  user_id: string
  reaction_type: "praying" | "answered" | "support"
  created_at?: string
}

/**
 * 기도방의 기도 요청 목록 조회
 */
export async function getPrayerRequests(roomId: string, options?: {
  category_id?: number
  is_answered?: boolean
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from("prayer_requests")
    .select(`
      *,
      users (
        user_id,
        name,
        email
      ),
      categories (
        category_id,
        name
      )
    `)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
  
  // 필터 적용
  if (options?.category_id) {
    query = query.eq("category_id", options.category_id)
  }
  
  if (options?.is_answered !== undefined) {
    query = query.eq("is_answered", options.is_answered)
  }
  
  // 페이지네이션 적용
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, (options.offset + (options.limit || 10) - 1))
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

/**
 * 특정 기도 요청 상세 조회
 */
export async function getPrayerRequestDetails(requestId: string) {
  const { data, error } = await supabase
    .from("prayer_requests")
    .select(`
      *,
      users (
        user_id,
        name,
        email
      ),
      categories (
        category_id,
        name
      )
    `)
    .eq("request_id", requestId)
    .single()
  
  if (error) throw error
  return data
}

/**
 * 새 기도 요청 등록
 */
export async function createPrayerRequest(data: {
  room_id: string
  user_id: string
  category_id?: number
  bible_verse?: string
  title: string
  content: string
  is_anonymous?: boolean
}) {
  const { room_id, user_id, category_id, bible_verse, title, content, is_anonymous = false } = data
  
  const { data: request, error } = await supabase
    .from("prayer_requests")
    .insert({
      room_id,
      user_id,
      category_id,
      bible_verse,
      title,
      content,
      is_anonymous,
      is_answered: false
    })
    .select()
    .single()
  
  if (error) throw error
  return request
}

/**
 * 기도 요청 수정
 */
export async function updatePrayerRequest(
  requestId: string,
  data: {
    category_id?: number
    bible_verse?: string
    title?: string
    content?: string
    is_anonymous?: boolean
  }
) {
  const { data: updatedRequest, error } = await supabase
    .from("prayer_requests")
    .update(data)
    .eq("request_id", requestId)
    .select()
    .single()
  
  if (error) throw error
  return updatedRequest
}

/**
 * 기도 요청 삭제
 */
export async function deletePrayerRequest(requestId: string) {
  const { error } = await supabase
    .from("prayer_requests")
    .delete()
    .eq("request_id", requestId)
  
  if (error) throw error
  return true
}

/**
 * 기도 요청 응답 상태 변경
 */
export async function updateAnsweredStatus(requestId: string, isAnswered: boolean) {
  const { data, error } = await supabase
    .from("prayer_requests")
    .update({ is_answered: isAnswered })
    .eq("request_id", requestId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * 기도 응답 등록
 */
export async function createPrayerAnswer(data: {
  request_id: string
  content: string
}) {
  const { request_id, content } = data
  
  // 1. 기도 응답 등록
  const { data: answer, error } = await supabase
    .from("prayer_answers")
    .insert({
      request_id,
      content
    })
    .select()
    .single()
  
  if (error) throw error
  
  // 2. 기도 요청 상태 변경
  await updateAnsweredStatus(request_id, true)
  
  return answer
}

/**
 * 기도 응답 목록 조회
 */
export async function getPrayerAnswers(requestId: string) {
  const { data, error } = await supabase
    .from("prayer_answers")
    .select("*")
    .eq("request_id", requestId)
    .order("answered_at", { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * 기도 요청에 반응 추가
 */
export async function addReaction(data: {
  request_id: string
  user_id: string
  reaction_type: "praying" | "answered" | "support"
}) {
  const { request_id, user_id, reaction_type } = data
  
  // 이미 같은 유형의 반응이 있는지 확인
  const { data: existingReaction, error: checkError } = await supabase
    .from("reactions")
    .select("*")
    .eq("request_id", request_id)
    .eq("user_id", user_id)
    .eq("reaction_type", reaction_type)
    .maybeSingle()
  
  // 이미 반응이 있으면 제거 (토글)
  if (existingReaction) {
    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("reaction_id", existingReaction.reaction_id)
    
    if (error) throw error
    return null
  }
  
  // 새로운 반응 추가
  const { data: reaction, error } = await supabase
    .from("reactions")
    .insert({
      request_id,
      user_id,
      reaction_type
    })
    .select()
    .single()
  
  if (error) throw error
  return reaction
}

/**
 * 기도 요청의 반응 목록 조회
 */
export async function getReactions(requestId: string) {
  const { data, error } = await supabase
    .from("reactions")
    .select(`
      *,
      users (
        user_id,
        name
      )
    `)
    .eq("request_id", requestId)
  
  if (error) throw error
  return data
}

/**
 * 사용자의 반응 상태 확인
 */
export async function getUserReactions(requestId: string, userId: string) {
  const { data, error } = await supabase
    .from("reactions")
    .select("reaction_type")
    .eq("request_id", requestId)
    .eq("user_id", userId)
  
  if (error) throw error
  
  // 반응 유형별로 객체로 변환
  const userReactions: Record<string, boolean> = {
    praying: false,
    answered: false,
    support: false
  }
  
  data.forEach(reaction => {
    userReactions[reaction.reaction_type] = true
  })
  
  return userReactions
}

/**
 * 기도 요청에 댓글 추가
 */
export async function addComment(data: {
  request_id: string
  user_id: string
  content: string
}) {
  const { request_id, user_id, content } = data
  
  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      request_id,
      user_id,
      content
    })
    .select()
    .single()
  
  if (error) throw error
  return comment
}

/**
 * 기도 요청의 댓글 목록 조회
 */
export async function getComments(requestId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      users (
        user_id,
        name,
        email
      )
    `)
    .eq("request_id", requestId)
    .order("created_at", { ascending: true })
  
  if (error) throw error
  return data
}

/**
 * 댓글 삭제
 */
export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("comment_id", commentId)
  
  if (error) throw error
  return true
}

/**
 * 카테고리 목록 조회
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })
  
  if (error) throw error
  return data
}

/**
 * 연도별 기도 요청 통계
 */
export async function getYearlyPrayerStatistics(userId: string, year: number) {
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`
  
  const { data, error } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
  
  if (error) throw error
  
  // 월별 통계 계산
  const monthlyStats = Array(12).fill(0)
  const answeredStats = Array(12).fill(0)
  
  data.forEach(request => {
    const month = new Date(request.created_at).getMonth()
    monthlyStats[month]++
    
    if (request.is_answered) {
      answeredStats[month]++
    }
  })
  
  return {
    total: data.length,
    answered: data.filter(r => r.is_answered).length,
    monthly: monthlyStats,
    monthlyAnswered: answeredStats
  }
} 