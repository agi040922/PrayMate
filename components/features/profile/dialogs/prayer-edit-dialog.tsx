"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useProfile } from "@/lib/context/ProfileContext"
import { 
  updatePrayerRequest, 
  updateAnsweredStatus, 
  createPrayerAnswer,
  getPrayerAnswers,
  deletePrayerAnswer
} from "@/lib/supabase/prayer-requests"

// 기본 카테고리 맵 정의
const DEFAULT_CATEGORIES = [
  { category_id: 1, name: "개인", description: "개인적인 기도제목" },
  { category_id: 2, name: "공동체", description: "공동체를 위한 기도제목" },
  { category_id: 3, name: "감사", description: "감사한 내용을 담은 기도제목" },
  { category_id: 4, name: "중보기도", description: "타인을 위한 중보기도" }
]

interface PrayerEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prayer: any
  onUpdate: () => void
}

export function PrayerEditDialog({ 
  open, 
  onOpenChange, 
  prayer, 
  onUpdate 
}: PrayerEditDialogProps) {
  const [title, setTitle] = useState(prayer?.title || "")
  const [content, setContent] = useState(prayer?.content || "")
  const [isAnonymous, setIsAnonymous] = useState(prayer?.is_anonymous || false)
  const [bibleReference, setBibleReference] = useState(prayer?.bible_verse?.reference || "")
  const [bibleText, setBibleText] = useState(prayer?.bible_verse?.text || "")
  const [categoryId, setCategoryId] = useState<number | undefined>(prayer?.category_id || undefined)
  const [isAnswered, setIsAnswered] = useState(prayer?.is_answered || false)
  const [answerContent, setAnswerContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { categories: profileCategories } = useProfile()
  const { toast } = useToast()
  
  // 사용할 카테고리 목록 (profileCategories가 비어있으면 DEFAULT_CATEGORIES 사용)
  const categories = profileCategories?.length > 0 ? profileCategories : DEFAULT_CATEGORIES
  
  // 응답 내용 불러오기
  useEffect(() => {
    const loadAnswers = async () => {
      if (prayer?.is_answered && prayer?.request_id) {
        try {
          const answers = await getPrayerAnswers(prayer.request_id)
          if (answers && answers.length > 0) {
            setAnswerContent(answers[0].content || "")
          }
        } catch (error) {
          console.error("응답 내용 불러오기 실패:", error)
        }
      }
    }
    
    if (open) {
      loadAnswers()
    }
  }, [open, prayer])
  
  // 기도제목 저장 함수
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive"
      })
      return
    }
    
    // 응답 표시하는데 응답 내용이 없는 경우
    if (isAnswered && !answerContent.trim()) {
      toast({
        title: "입력 오류",
        description: "응답 내용을 입력해주세요.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 1. 기도제목 정보 업데이트
      await updatePrayerRequest(prayer.request_id, {
        title,
        content,
        is_anonymous: isAnonymous,
        category_id: categoryId,
        bible_verse: (bibleReference && bibleText) ? {
          reference: bibleReference,
          text: bibleText
        } : undefined
      })
      
      // 2. 응답 상태 변경
      if (isAnswered !== prayer.is_answered) {
        await updateAnsweredStatus(prayer.request_id, isAnswered)
      }
      
      // 3. 응답된 경우 응답 내용 저장
      if (isAnswered && answerContent.trim()) {
        // 기존 응답이 있는지 확인
        const answers = await getPrayerAnswers(prayer.request_id)
        
        if (answers && answers.length > 0) {
          // 기존 응답을 삭제하고 새로 만드는 방식으로 구현
          try {
            // 1. 기존 응답을 삭제
            await deletePrayerAnswer(answers[0].answer_id)
            
            // 2. 새 응답 추가
            await createPrayerAnswer({
              request_id: prayer.request_id,
              content: answerContent
            })
          } catch (error) {
            console.error("응답 업데이트 실패:", error)
            throw error
          }
        } else {
          // 새 응답 추가
          await createPrayerAnswer({
            request_id: prayer.request_id,
            content: answerContent
          })
        }
      }
      
      toast({
        title: "기도제목 수정 완료",
        description: "기도제목이 성공적으로 수정되었습니다."
      })
      
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error("기도제목 수정 실패:", error)
      toast({
        title: "수정 실패",
        description: "기도제목을 수정하는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>기도제목 수정</DialogTitle>
          <DialogDescription>
            기도제목의 내용을 수정하고 변경사항을 저장하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-2 overflow-y-auto">
          {/* 카테고리 선택 */}
          <div className="grid gap-2">
            <Label htmlFor="category">카테고리</Label>
            <Select 
              value={(categoryId !== undefined) ? categoryId.toString() : "none"} 
              onValueChange={(value) => setCategoryId(value === "none" ? undefined : parseInt(value))}
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">카테고리 없음</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.category_id} value={category.category_id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 제목 입력 */}
          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="기도제목 제목을 입력하세요"
              className="min-h-[44px]"
            />
          </div>
          
          {/* 내용 입력 */}
          <div className="grid gap-2">
            <Label htmlFor="content">내용</Label>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="기도제목 내용을 입력하세요"
              className="h-24 min-h-[100px]"
            />
          </div>
          
          {/* 성경구절 입력 */}
          <div className="grid gap-2">
            <Label htmlFor="bible">성경구절</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input 
                id="bible-reference" 
                value={bibleReference} 
                onChange={(e) => setBibleReference(e.target.value)} 
                placeholder="예: 요한복음 3:16"
                className="min-h-[44px]"
              />
              <Input 
                id="bible-text" 
                value={bibleText} 
                onChange={(e) => setBibleText(e.target.value)} 
                placeholder="구절 내용"
                className="min-h-[44px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">성경구절 참조와 내용을 함께 입력하세요.</p>
          </div>
          
          {/* 응답 여부 */}
          <div className="flex items-center gap-2 py-1">
            <Checkbox 
              id="answered" 
              checked={isAnswered} 
              onCheckedChange={(checked) => setIsAnswered(checked === true)}
              className="h-5 w-5"
            />
            <Label htmlFor="answered" className="cursor-pointer">기도 응답 표시</Label>
          </div>
          
          {/* 응답 내용 입력 (응답 체크한 경우에만 표시) */}
          {isAnswered && (
            <div className="grid gap-2">
              <Label htmlFor="answer">응답 내용</Label>
              <Textarea 
                id="answer" 
                value={answerContent} 
                onChange={(e) => setAnswerContent(e.target.value)} 
                placeholder="하나님의 응답을 기록하세요"
                className="h-24 min-h-[100px]"
              />
            </div>
          )}
          
          {/* 익명 여부 */}
          <div className="flex items-center gap-2 py-1">
            <Checkbox 
              id="anonymous" 
              checked={isAnonymous} 
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              className="h-5 w-5"
            />
            <Label htmlFor="anonymous" className="cursor-pointer">익명으로 게시</Label>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-2 border-t">
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px]"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 