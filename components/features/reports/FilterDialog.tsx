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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/context/AuthContext"
import { getUserPrayerRoomsForFilter, getRoomMembersForFilter } from "@/lib/supabase/reports"

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
  onRoomChange: (value: string) => void
  memberId: string
  onMemberChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  period: "all" | "weekly" | "monthly" | "yearly"
  onPeriodChange: (value: "all" | "weekly" | "monthly" | "yearly") => void
}

export default function FilterDialog({
  open,
  onOpenChange,
  roomId,
  onRoomChange,
  memberId,
  onMemberChange,
  category,
  onCategoryChange,
  period,
  onPeriodChange
}: FilterDialogProps) {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<{room_id: string, title: string}[]>([])
  const [members, setMembers] = useState<{user_id: string, name: string}[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)

  // 사용자의 기도방 목록 로드
  useEffect(() => {
    const loadRooms = async () => {
      if (!user) return

      try {
        setLoadingRooms(true)
        const roomData = await getUserPrayerRoomsForFilter(user.id)
        setRooms(roomData)
      } catch (error) {
        console.error("기도방 목록 로딩 실패:", error)
      } finally {
        setLoadingRooms(false)
      }
    }

    if (open) {
      loadRooms()
    }
  }, [user, open])

  // 선택된 기도방의 구성원 목록 로드
  useEffect(() => {
    const loadMembers = async () => {
      if (!roomId || roomId === 'all') {
        setMembers([])
        return
      }

      try {
        setLoadingMembers(true)
        const memberData = await getRoomMembersForFilter(roomId)
        setMembers(memberData)
      } catch (error) {
        console.error("기도방 구성원 로딩 실패:", error)
      } finally {
        setLoadingMembers(false)
      }
    }

    if (open) {
      loadMembers()
    }
  }, [roomId, open])

  // 기도방 변경시 구성원 선택 초기화
  const handleRoomChange = (value: string) => {
    onRoomChange(value)
    onMemberChange('all') // 방이 변경되면 멤버는 '전체'로 초기화
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>리포트 필터 설정</DialogTitle>
          <DialogDescription>리포트에 포함할 기도제목을 필터링하세요</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 기도방 선택 */}
          <div className="grid gap-2">
            <Label htmlFor="prayer-room">기도방</Label>
            {loadingRooms ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={roomId} onValueChange={handleRoomChange}>
                <SelectTrigger id="prayer-room">
                  <SelectValue placeholder="기도방 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 기도방</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.room_id} value={room.room_id}>
                      {room.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 구성원 선택 */}
          <div className="grid gap-2">
            <Label htmlFor="member">구성원</Label>
            {loadingMembers ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={memberId} 
                onValueChange={onMemberChange}
                disabled={roomId === 'all' || !members.length}
              >
                <SelectTrigger id="member">
                  <SelectValue placeholder="구성원 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 구성원</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name || '이름 없음'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {roomId === 'all' && (
              <p className="text-xs text-muted-foreground">기도방을 선택하면 구성원을 필터링할 수 있습니다.</p>
            )}
          </div>

          {/* 기간 선택 */}
          <div className="grid gap-2">
            <Label htmlFor="period">기간</Label>
            <Select value={period} onValueChange={(value) => onPeriodChange(value as any)}>
              <SelectTrigger id="period">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 기간</SelectItem>
                <SelectItem value="weekly">주간</SelectItem>
                <SelectItem value="monthly">월간</SelectItem>
                <SelectItem value="yearly">연간</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 카테고리 선택 */}
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