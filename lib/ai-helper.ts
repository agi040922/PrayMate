/**
 * AI 도우미 - 기도제목 다듬기와 성경 구절 추천을 위한 기능
 */

// 성경 구절 추천 타입 정의
export interface BibleVerseRecommendation {
  reference: string;  // 예: "요한복음 3:16"
  text: string;       // 실제 말씀 내용
  relevance: string;  // 이 구절이 왜 추천되었는지 설명
}

// API 호출 함수 (서버 API 라우트를 호출)
async function callPrayerAPI(action: string, content: string) {
  try {
    const response = await fetch('/api/prayer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API 호출 중 오류가 발생했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
}

// 기도제목 제목 다듬기 함수
export async function refinePrayerTitle(title: string): Promise<string> {
  try {
    const data = await callPrayerAPI('refine-title', title);
    return data.result || '제목 다듬기에 실패했습니다.';
  } catch (error) {
    console.error("제목 다듬기 오류:", error);
    throw new Error("제목을 다듬는 중 오류가 발생했습니다.");
  }
}

// 기도제목 내용 다듬기 함수
export async function refinePrayerContent(content: string): Promise<string> {
  try {
    const data = await callPrayerAPI('refine-content', content);
    return data.result || '내용 다듬기에 실패했습니다.';
  } catch (error) {
    console.error("내용 다듬기 오류:", error);
    throw new Error("내용을 다듬는 중 오류가 발생했습니다.");
  }
}

// 성경 구절 추천 함수
export async function recommendBibleVerses(content: string): Promise<BibleVerseRecommendation[]> {
  try {
    const data = await callPrayerAPI('suggest-verses', content);
    
    if (data.verses && Array.isArray(data.verses)) {
      return data.verses;
    }
    
    // 기본 응답 (API 호출 실패 또는 잘못된 응답 형식인 경우)
    return [
      {
        reference: "요한복음 3:16",
        text: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라",
        relevance: "하나님의 사랑과 구원에 관한 말씀"
      },
      {
        reference: "시편 23:1",
        text: "여호와는 나의 목자시니 내게 부족함이 없으리로다",
        relevance: "하나님의 보호와 공급에 관한 말씀"
      },
      {
        reference: "빌립보서 4:13",
        text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라",
        relevance: "하나님이 주시는 힘과 용기에 관한 말씀"
      }
    ];
  } catch (error) {
    console.error("성경 구절 추천 오류:", error);
    throw new Error("성경 구절을 추천하는 중 오류가 발생했습니다.");
  }
} 