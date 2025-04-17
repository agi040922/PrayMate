"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { 
  refinePrayerTitle, 
  refinePrayerContent, 
  recommendBibleVerses,
  BibleVerseRecommendation
} from "@/lib/ai-helper"

interface PrayerAIHelperProps {
  title: string
  content: string
  onApplyTitle: (title: string) => void
  onApplyContent: (content: string) => void
  onApplyVerse: (verse: string) => void
}

export function PrayerAIHelper({
  title,
  content,
  onApplyTitle,
  onApplyContent,
  onApplyVerse
}: PrayerAIHelperProps) {
  const [activeTab, setActiveTab] = useState("refine")
  const [isLoading, setIsLoading] = useState(false)
  const [refinedTitle, setRefinedTitle] = useState("")
  const [refinedContent, setRefinedContent] = useState("")
  const [bibleVerses, setBibleVerses] = useState<BibleVerseRecommendation[]>([])

  // 제목과 내용 다듬기
  const handleRefine = async () => {
    if (!title && !content) {
      toast({
        title: "입력 필요",
        description: "제목이나 내용을 먼저 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      if (title) {
        const newTitle = await refinePrayerTitle(title)
        setRefinedTitle(newTitle)
      }

      if (content) {
        const newContent = await refinePrayerContent(content)
        setRefinedContent(newContent)
      }
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "내용을 다듬는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 성경 구절 추천
  const handleRecommendVerses = async () => {
    if (!content) {
      toast({
        title: "입력 필요",
        description: "내용을 먼저 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const verses = await recommendBibleVerses(content)
      setBibleVerses(verses)
      setActiveTab("verses")
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "성경 구절을 추천하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 다듬어진 제목 적용
  const applyRefinedTitle = () => {
    if (refinedTitle) {
      onApplyTitle(refinedTitle)
      toast({
        title: "제목 적용 완료",
        description: "다듬어진 제목이 적용되었습니다.",
      })
    }
  }

  // 다듬어진 내용 적용
  const applyRefinedContent = () => {
    if (refinedContent) {
      onApplyContent(refinedContent)
      toast({
        title: "내용 적용 완료",
        description: "다듬어진 내용이 적용되었습니다.",
      })
    }
  }

  // 성경 구절 적용
  const applyVerse = (verse: BibleVerseRecommendation) => {
    onApplyVerse(`${verse.reference} - ${verse.text}`)
    toast({
      title: "성경 구절 적용 완료",
      description: `${verse.reference} 말씀이 적용되었습니다.`,
    })
  }

  return (
    <div className="w-full">
      <div className="p-2">
        <CardHeader className="p-3 pb-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium flex items-center">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="h-4 w-4 mr-2 text-blue-500" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4Z" 
                  fill="currentColor"
                />
              </svg>
              AI 기도 도우미
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            기도제목을 정리하고 관련 성경 구절을 추천해드려요
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="refine">내용 다듬기</TabsTrigger>
              <TabsTrigger value="verses">성경구절 추천</TabsTrigger>
            </TabsList>
            
            <TabsContent value="refine" className="space-y-4">
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  className="w-full bg-blue-500 hover:bg-blue-600" 
                  onClick={handleRefine}
                  disabled={isLoading || (!title && !content)}
                  type="button"
                >
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  내용 다듬기
                </Button>
                
                {refinedTitle && (
                  <div className="space-y-1 mt-2 p-2 border rounded-md border-blue-100 dark:border-blue-900">
                    <div className="text-xs font-medium">다듬어진 제목:</div>
                    <p className="text-sm">{refinedTitle}</p>
                    <Button size="sm" variant="outline" className="w-full mt-1" onClick={applyRefinedTitle} type="button">
                      제목에 적용하기
                    </Button>
                  </div>
                )}
                
                {refinedContent && (
                  <div className="space-y-1 mt-2 p-2 border rounded-md border-blue-100 dark:border-blue-900">
                    <div className="text-xs font-medium">다듬어진 내용:</div>
                    <p className="text-sm">{refinedContent}</p>
                    <Button size="sm" variant="outline" className="w-full mt-1" onClick={applyRefinedContent} type="button">
                      내용에 적용하기
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="verses" className="space-y-4">
              <Button 
                size="sm" 
                className="w-full bg-purple-500 hover:bg-purple-600" 
                onClick={handleRecommendVerses}
                disabled={isLoading || !content}
                type="button"
              >
                {isLoading ? <Spinner className="mr-2" /> : null}
                성경 구절 추천받기
              </Button>
              
              {bibleVerses.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bibleVerses.map((verse, index) => (
                    <div key={index} className="p-2 border rounded-md border-purple-100 dark:border-purple-900">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                          {verse.reference}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => applyVerse(verse)} type="button">
                          적용
                        </Button>
                      </div>
                      <p className="text-xs mt-1">{verse.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{verse.relevance}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </div>
  )
}
// 1. AI 도우미 버튼 개선
// 이전의 단순한 버튼에서 그라데이션 효과가 적용된 화려한 디자인으로 변경
// 애니메이션 효과가 있는 아이콘 추가
// "신규" 배지를 추가하여 눈에 더 잘 띄도록 개선
// 호버 시 약간 위로 뜨는 효과 추가로 더 직관적인 인터랙션 제공

// 2. AI 도우미 패널 위치 변경
// 이전: 입력 폼 아래에 나타나서 입력 폼과 함께 보기 어려움
// 개선: 오른쪽에 나타나도록 변경하여 기도제목 작성 폼과 AI 도우미를 동시에 볼 수 있음
// 전체 다이얼로그 너비를 600px로 확장하여 두 요소가 나란히 표시될 공간 확보

// 3. AI 도우미 패널 디자인 개선
// 그라데이션 헤더 추가
// 탭별로 색상 테마 적용(파란색/보라색)
// 성경 구절 뱃지에 색상 추가하여 시각적으로 더 구분되도록 개선
// 전체적으로 더 풍부한 시각적 계층 구조 적용

// 4. OpenAI GPT-4 Turbo API 연동
// 기존의 더미 응답 대신 실제 OpenAI API를 호출하도록 변경
// GPT-4-turbo 모델 사용으로 더 정확하고 자연스러운 추천 제공
// 두 가지 전문화된 API 호출 함수 구현:
// callOpenAI: 일반 텍스트 응답용
// callOpenAIForVerses: JSON 형식의 성경 구절 추천용
// 시스템 프롬프트에 기독교 컨텍스트 추가로 더 적절한 기도제목 및 구절 추천 가능
// 실패 시 폴백 옵션 제공으로 안정성 향상

// 5. 기도제목 폼 레이아웃 개선
// 좌우 분할 레이아웃으로 변경하여 더 효율적인 공간 활용
// 왼쪽에는 입력 폼, 오른쪽에는 AI 도우미가 배치되는 직관적인 구조
// 이 변경을 통해 사용자는 기도제목을 작성하면서 동시에 AI 도우미의 도움을 받을 수 있게 되었으며, 더 아름다운 디자인과 편리한 UX를 제공받게 되었습니다.

// 1. 환경 변수 변경
// NEXT_PUBLIC_OPENAI_API_KEY를 제거하고 OPENAI_API_KEY로 변경하여 클라이언트에 노출되지 않도록 함
// 2. 서버 API 라우트 생성
// app/api/prayer/route.ts 파일 생성
// Next.js API 라우트에서만 OpenAI API 호출 코드 실행
// 세 가지 기능 구현:
// 제목 다듬기 (refine-title)
// 내용 다듬기 (refine-content)
// 성경 구절 추천 (suggest-verses)
// 에러 처리 및 폴백 로직 추가
// 3. 클라이언트 코드 변경
// lib/ai-helper.ts 파일에서 직접 OpenAI API를 호출하는 코드 제거
// 대신 /api/prayer 라우트로 API 요청을 보내는 코드로 변경
// 클라이언트 측에서는 API 키 노출 없이 백엔드 API만 호출
// 작동 방식
// 사용자가 기도 제목 입력
// AI 도우미 버튼 클릭
// 클라이언트에서 /api/prayer API 호출
// 서버에서 안전하게 OpenAI API 처리 후 결과 반환
// 클라이언트에서 결과 표시 및 적용
// 이제 보안 문제 없이 GPT-4-turbo API를 안전하게, 그리고 효과적으로 사용할 수 있습니다. 이 변경으로 API 키가 노출되지 않으면서도 동일한 AI 기능을 제공할 수 있게 되었습니다.
// 변경된 부분을 적용하려면 애플리케이션을 다시 시작해야 합니다. 그러면 브라우저에서 OpenAI API 키를 사용하려는 시도가 발생하지 않아 오류가 해결될 것입니다.