"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prayerRoom: string
  onPrayerRoomChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
}

export default function FilterDialog({
  open,
  onOpenChange,
  prayerRoom,
  onPrayerRoomChange,
  category,
  onCategoryChange,
}: FilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>리포트 필터 설정</DialogTitle>
          <DialogDescription>리포트에 포함할 기도제목을 필터링하세요</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prayer-room">기도방</Label>
            <Select value={prayerRoom} onValueChange={onPrayerRoomChange}>
              <SelectTrigger id="prayer-room">
                <SelectValue placeholder="기도방 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 기도방</SelectItem>
                <SelectItem value="family">가족을 위한 기도</SelectItem>
                <SelectItem value="church">교회 공동체</SelectItem>
                <SelectItem value="mission">선교사 중보기도</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger id="category">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                <SelectItem value="personal">개인</SelectItem>
                <SelectItem value="community">공동체</SelectItem>
                <SelectItem value="thanksgiving">감사</SelectItem>
                <SelectItem value="intercession">중보기도</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={() => onOpenChange(false)}>적용</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 