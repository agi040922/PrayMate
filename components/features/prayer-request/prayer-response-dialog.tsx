"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PrayerResponseDialogProps {
  prayerId: string
  onClose: () => void
}

export function PrayerResponseDialog({ prayerId, onClose }: PrayerResponseDialogProps) {
  const [response, setResponse] = useState("")

  const handleSubmit = () => {
    if (!response.trim()) return

    // 여기서 응답 저장 로직 구현
    console.log("Prayer response saved:", { prayerId, response })

    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>기도 응답 기록</DialogTitle>
          <DialogDescription>하나님께서 응답해주신 내용을 기록하고 팀원들과 공유해보세요.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="response">응답 내용</Label>
            <Textarea
              id="response"
              placeholder="하나님께서 어떻게 응답해주셨는지 기록해보세요..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={!response.trim()}>
            응답 기록하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
