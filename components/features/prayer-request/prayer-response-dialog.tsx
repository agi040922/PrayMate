"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import { createPrayerAnswer, updateAnsweredStatus } from "@/lib/supabase/prayer-requests"

interface PrayerResponseDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrayerResponseDialog({ requestId, open, onOpenChange }: PrayerResponseDialogProps) {
  const [responseContent, setResponseContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "기도 응답을 등록하려면 로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }
    
    if (!responseContent.trim()) {
      toast({
        title: "입력 오류",
        description: "응답 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 1. 기도 응답 등록
      await createPrayerAnswer({
        request_id: requestId,
        content: responseContent
      })
      
      // 2. 기도 요청 상태 변경 (이미 createPrayerAnswer 내부에서 처리됨)
      
      toast({
        title: "기도 응답 등록 완료",
        description: "기도 응답이 성공적으로 등록되었습니다.",
      })
      
      onOpenChange(false)
    } catch (error: any) {
      console.error("기도 응답 등록 실패:", error)
      toast({
        title: "등록 실패",
        description: error.message || "기도 응답 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>기도 응답 등록</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="하나님께서 어떻게 응답해주셨는지 나눠주세요..."
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "응답 등록"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
