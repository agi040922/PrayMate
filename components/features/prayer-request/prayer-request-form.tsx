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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PrayerRequestFormProps {
  onClose: () => void
}

export function PrayerRequestForm({ onClose }: PrayerRequestFormProps) {
  const [category, setCategory] = useState("")

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 기도제목 등록</DialogTitle>
          <DialogDescription>기도제목을 작성하여 공유해보세요. 함께 기도하는 공동체가 응원합니다.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input id="title" placeholder="기도제목의 제목을 입력하세요" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">개인</SelectItem>
                <SelectItem value="community">공동체</SelectItem>
                <SelectItem value="thanksgiving">감사</SelectItem>
                <SelectItem value="intercession">중보기도</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">내용</Label>
            <Textarea id="content" placeholder="기도제목의 내용을 자세히 적어주세요" rows={4} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="verse">성경구절 (선택사항)</Label>
            <Input id="verse" placeholder="관련 성경구절이 있다면 입력해주세요" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">등록하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
