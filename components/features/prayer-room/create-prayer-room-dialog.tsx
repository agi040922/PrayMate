"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Globe, Lock } from "lucide-react"

interface CreatePrayerRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePrayerRoomDialog({ open, onOpenChange }: CreatePrayerRoomDialogProps) {
  const [roomType, setRoomType] = useState<"public" | "private">("public")
  const [inviteOnly, setInviteOnly] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 여기에 기도방 생성 로직 구현
    console.log("기도방 생성 요청")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 기도방 만들기</DialogTitle>
            <DialogDescription>새로운 기도방을 만들어 함께 기도할 멤버들을 초대하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">기도방 이름</Label>
              <Input id="name" placeholder="기도방 이름을 입력하세요" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">기도방 설명</Label>
              <Textarea id="description" placeholder="기도방에 대한 설명을 입력하세요" className="min-h-[80px]" />
            </div>
            <div className="grid gap-2">
              <Label>기도방 공개 설정</Label>
              <RadioGroup
                value={roomType}
                onValueChange={(value) => setRoomType(value as "public" | "private")}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex items-center gap-2 font-normal">
                    <Globe className="h-4 w-4" />
                    공개 기도방
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex items-center gap-2 font-normal">
                    <Lock className="h-4 w-4" />
                    비공개 기도방
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {roomType === "public"
                  ? "공개 기도방은 모든 사용자가 검색하고 참여할 수 있습니다."
                  : "비공개 기도방은 초대를 통해서만 참여할 수 있습니다."}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="invite-only">초대 코드로만 참여 가능</Label>
                <p className="text-xs text-muted-foreground">
                  활성화하면 초대 코드가 있는 사용자만 참여할 수 있습니다.
                </p>
              </div>
              <Switch
                id="invite-only"
                checked={inviteOnly}
                onCheckedChange={setInviteOnly}
                disabled={roomType === "private"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">기도방 만들기</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
