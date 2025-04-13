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

interface PrayerRequestFormProps {
  roomId?: string
  onClose: () => void
}

export function PrayerRequestForm({ roomId, onClose }: PrayerRequestFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [bibleVerse, setBibleVerse] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{ category_id: number; name: string }[]>([])
  
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
      
      await createPrayerRequest({
        room_id: roomId,
        user_id: user.id,
        title,
        content,
        bible_verse: bibleVerse || undefined,
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 기도제목 등록</DialogTitle>
            <DialogDescription>기도제목을 작성하여 공유해보세요. 함께 기도하는 공동체가 응원합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="verse">성경구절 (선택사항)</Label>
              <Input 
                id="verse" 
                placeholder="관련 성경구절이 있다면 입력해주세요" 
                value={bibleVerse}
                onChange={(e) => setBibleVerse(e.target.value)}
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
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "등록하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
