"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import { createPrayerRequest, getCategories } from "@/lib/supabase/prayer-requests"
import { PrayerAIHelper } from "./prayer-ai-helper"

interface PrayerRequestFormProps {
  roomId?: string
  onClose: () => void
}

export function PrayerRequestForm({ roomId, onClose }: PrayerRequestFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [bibleReference, setBibleReference] = useState("")
  const [bibleText, setBibleText] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{ category_id: number; name: string }[]>([])
  const [showAIHelper, setShowAIHelper] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()
  
  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data || [])
      } catch (error) {
        console.error("카테고리 로딩 실패:", error)
      }
    }
    
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }
    
    if (!roomId) {
      toast({
        title: "오류",
        description: "기도방 ID가 필요합니다.",
        variant: "destructive",
      })
      return
    }
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const parsedCategoryId = categoryId ? parseInt(categoryId) : undefined
      const bibleVerse = bibleReference ? { reference: bibleReference, text: bibleText } : undefined
      
      await createPrayerRequest({
        room_id: roomId,
        user_id: user.id,
        title,
        content,
        bible_verse: bibleVerse,
        category_id: parsedCategoryId,
        is_anonymous: isAnonymous
      })
      
      toast({
        title: "기도 요청 등록 완료",
        description: "기도 요청이 성공적으로 등록되었습니다."
      })
      
      onClose()
      
      // 성공 후 페이지 새로고침 또는 다른 처리
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error("기도 요청 등록 실패:", error)
      toast({
        title: "등록 실패",
        description: error.message || "기도 요청 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // AI 도우미 관련 핸들러
  const handleApplyTitle = (newTitle: string) => {
    setTitle(newTitle)
  }
  
  const handleApplyContent = (newContent: string) => {
    setContent(newContent)
  }
  
  const handleApplyVerse = (verse: string) => {
    // verse에서 reference와 text를 분리하는 로직 추가 필요
    const parts = verse.split(' - ');
    if (parts.length >= 2) {
      setBibleReference(parts[0]);
      setBibleText(parts.slice(1).join(' - '));
      
      // 업데이트 후 사용자에게 알림
      toast({
        title: "성경 구절이 폼에 적용되었습니다",
        description: `구절: ${parts[0]}`,
        variant: "default",
      });
    } else {
      setBibleReference(verse);
    }
  }

  const toggleAIHelper = () => {
    setShowAIHelper(!showAIHelper);
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 기도제목 등록</DialogTitle>
            <DialogDescription>기도제목을 작성하여 공유해보세요. 함께 기도하는 공동체가 응원합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">제목</Label>
                <Input 
                  id="title" 
                  placeholder="기도제목의 제목을 입력하세요" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">카테고리</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.category_id} value={String(category.category_id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">내용</Label>
                <Textarea 
                  id="content" 
                  placeholder="기도제목의 내용을 자세히 적어주세요" 
                  rows={4} 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bibleReference">성경구절 참조 (선택사항)</Label>
                <Input 
                  id="bibleReference" 
                  placeholder="예: 요한복음 3:16" 
                  value={bibleReference}
                  onChange={(e) => setBibleReference(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bibleText">성경구절 내용 (선택사항)</Label>
                <Textarea 
                  id="bibleText" 
                  placeholder="구절 내용을 입력해주세요" 
                  rows={2}
                  value={bibleText}
                  onChange={(e) => setBibleText(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">익명으로 올리기</Label>
              </div>
            </div>
          </div>
          
          {/* AI 도우미 패널 */}
          {showAIHelper && (
            <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center sm:relative sm:inset-auto">
              <div className="relative w-full max-w-lg sm:max-w-md max-h-[80vh] overflow-y-auto p-4 rounded-lg border bg-background shadow-lg">
                <button 
                  type="button"
                  className="absolute right-2 top-2 rounded-full p-1 text-gray-500 hover:bg-gray-100"
                  onClick={toggleAIHelper}
                >
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
                </button>
                
                <PrayerAIHelper
                  title={title}
                  content={content}
                  onApplyTitle={handleApplyTitle}
                  onApplyContent={handleApplyContent}
                  onApplyVerse={handleApplyVerse}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <div className="flex flex-1 justify-start">
              <Button 
                type="button" 
                onClick={toggleAIHelper}
                variant="outline"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                <div className="flex items-center gap-1">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="h-4 w-4 mr-1" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4Z" 
                      fill="currentColor"
                    />
                  </svg>
                  AI 도우미
                </div>
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "등록 중..." : "등록하기"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
