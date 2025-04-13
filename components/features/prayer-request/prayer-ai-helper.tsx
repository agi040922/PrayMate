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
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="relative">
      {/* AI 버튼 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute right-0 -top-10 flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M12 2a8 8 0 0 1 8 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a8 8 0 0 1 8-8Z" />
          <path d="M20 10a8 8 0 0 0-16 0" />
          <path d="M8 16v-2" />
          <path d="M16 16v-2" />
          <path d="M12 16v-2" />
        </svg>
        AI 도우미
      </Button>

      {/* AI 도우미 패널 */}
      {isOpen && (
        <Card className="absolute -right-2 top-10 w-80 z-50 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">AI 기도 도우미</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="sr-only">닫기</span>
              </Button>
            </div>
            <CardDescription className="text-xs">
              기도제목을 정리하고 관련 성경 구절을 추천해드려요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="refine">내용 다듬기</TabsTrigger>
                <TabsTrigger value="verses">성경구절 추천</TabsTrigger>
              </TabsList>
              
              <TabsContent value="refine" className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full" 
                    onClick={handleRefine}
                    disabled={isLoading || (!title && !content)}
                  >
                    {isLoading ? <Spinner className="mr-2" /> : null}
                    내용 다듬기
                  </Button>
                  
                  {refinedTitle && (
                    <div className="space-y-1 mt-2 p-2 border rounded-md">
                      <div className="text-xs font-medium">다듬어진 제목:</div>
                      <p className="text-sm">{refinedTitle}</p>
                      <Button size="sm" variant="outline" className="w-full mt-1" onClick={applyRefinedTitle}>
                        제목에 적용하기
                      </Button>
                    </div>
                  )}
                  
                  {refinedContent && (
                    <div className="space-y-1 mt-2 p-2 border rounded-md">
                      <div className="text-xs font-medium">다듬어진 내용:</div>
                      <p className="text-sm">{refinedContent}</p>
                      <Button size="sm" variant="outline" className="w-full mt-1" onClick={applyRefinedContent}>
                        내용에 적용하기
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="verses" className="space-y-4">
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={handleRecommendVerses}
                  disabled={isLoading || !content}
                >
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  성경 구절 추천받기
                </Button>
                
                {bibleVerses.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {bibleVerses.map((verse, index) => (
                      <div key={index} className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{verse.reference}</Badge>
                          <Button size="sm" variant="ghost" onClick={() => applyVerse(verse)}>
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
        </Card>
      )}
    </div>
  )
} 