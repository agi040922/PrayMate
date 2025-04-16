"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateAnsweredStatus, createPrayerAnswer } from "@/lib/supabase/prayer-requests"

interface AnswerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prayer: any
  onUpdate: () => void
}

export function AnswerDialog({ 
  open, 
  onOpenChange, 
  prayer, 
  onUpdate 
}: AnswerDialogProps) {
  const [answerContent, setAnswerContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const handleSave = async () => {
    if (!answerContent.trim()) {
      toast({
        title: "입력 오류",
        description: "응답 내용을 입력해주세요.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 1. 기도제목을 응답됨으로 표시
      await updateAnsweredStatus(prayer.request_id, true)
      
      // 2. 응답 내용 저장
      await createPrayerAnswer({
        request_id: prayer.request_id,
        content: answerContent
      })
      
      toast({
        title: "응답 추가 완료",
        description: "기도 응답이 성공적으로 추가되었습니다."
      })
      
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error("응답 추가 실패:", error)
      toast({
        title: "응답 추가 실패",
        description: "응답을 추가하는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>응답 추가하기</DialogTitle>
          <DialogDescription>
            하나님께서 응답하신 내용을 기록하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="answer">응답 내용</Label>
            <Textarea 
              id="answer" 
              value={answerContent} 
              onChange={(e) => setAnswerContent(e.target.value)} 
              placeholder="하나님의 응답을 기록하세요"
              className="h-32"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "응답 추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 