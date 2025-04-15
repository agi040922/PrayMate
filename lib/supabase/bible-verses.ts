import { supabase } from '../supabaseClient'

// 성경 구절 타입 정의
export interface BibleVerse {
  verse_id: string
  request_id: string
  reference: string
  text: string
}

/**
 * 성경 구절 추가
 */
export async function createBibleVerse(data: {
  request_id: string
  reference: string
  text: string
}): Promise<BibleVerse> {
  const { request_id, reference, text } = data
  
  const { data: verse, error } = await supabase
    .from("bible_verses")
    .insert({
      request_id,
      reference,
      text
    })
    .select()
    .single()
  
  if (error) throw error
  return verse
}

/**
 * 기도 요청 ID로 성경 구절 조회
 */
export async function getBibleVerseByRequestId(requestId: string): Promise<BibleVerse | null> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle()
  
  if (error) throw error
  return data
}

/**
 * 성경 구절 업데이트
 */
export async function updateBibleVerse(
  verseId: string,
  data: {
    reference?: string
    text?: string
  }
): Promise<BibleVerse> {
  const { data: verse, error } = await supabase
    .from("bible_verses")
    .update(data)
    .eq("verse_id", verseId)
    .select()
    .single()
  
  if (error) throw error
  return verse
}

/**
 * 성경 구절 삭제
 */
export async function deleteBibleVerse(verseId: string): Promise<boolean> {
  const { error } = await supabase
    .from("bible_verses")
    .delete()
    .eq("verse_id", verseId)
  
  if (error) throw error
  return true
}

/**
 * 기도 요청에 연결된 성경 구절 삭제
 */
export async function deleteBibleVerseByRequestId(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from("bible_verses")
    .delete()
    .eq("request_id", requestId)
  
  if (error) throw error
  return true
}

/**
 * 많이 사용되는 성경 구절 목록 조회
 */
export async function getPopularBibleVerses(limit: number = 10): Promise<{reference: string, text: string, count: number}[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("reference, text")
    .limit(1000)
  
  if (error) throw error
  
  // 참조 기준으로 그룹화하여 가장 많이 사용된 구절 계산
  const verseCounts: Record<string, {reference: string, text: string, count: number}> = {}
  
  data.forEach(verse => {
    const key = verse.reference
    if (verseCounts[key]) {
      verseCounts[key].count++
    } else {
      verseCounts[key] = {
        reference: verse.reference,
        text: verse.text,
        count: 1
      }
    }
  })
  
  // 사용 빈도순으로 정렬
  const popular = Object.values(verseCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
  
  return popular
} 