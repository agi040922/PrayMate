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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
  onRoomChange: (value: string) => void
  memberId: string
  onMemberChange: (value: string) => void
  memberIds?: string[]
  onMemberIdsChange?: (value: string[]) => void
  category: string
  onCategoryChange: (value: string) => void
  period: "all" | "weekly" | "monthly" | "yearly"
  onPeriodChange: (value: "all" | "weekly" | "monthly" | "yearly") => void
  includePersonalPrayers: boolean
  onIncludePersonalPrayersChange: (value: boolean) => void
  personalPrayerType: "weekly" | "monthly" | "yearly"
  onPersonalPrayerTypeChange: (value: "weekly" | "monthly" | "yearly") => void
  onlyPeriodPrayers: boolean
  onOnlyPeriodPrayersChange: (value: boolean) => void
}

export default function FilterDialog({
  open,
  onOpenChange,
  roomId,
  onRoomChange,
  memberId,
  onMemberChange,
  memberIds = [],
  onMemberIdsChange = () => {},
  category,
  onCategoryChange,
  period,
  onPeriodChange,
  includePersonalPrayers,
  onIncludePersonalPrayersChange,
  personalPrayerType,
  onPersonalPrayerTypeChange,
  onlyPeriodPrayers,
  onOnlyPeriodPrayersChange
}: FilterDialogProps) {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<{room_id: string, title: string}[]>([])
  const [members, setMembers] = useState<{user_id: string, name: string}[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>(memberIds)

  // 사용자의 기도방 목록 로드
  useEffect(() => {
    const loadRooms = async () => {
      if (!user) return

      try {
        setLoadingRooms(true)
        const roomData = await getUserPrayerRoomsForFilter(user.id)
        setRooms(roomData as any) // 타입 오류 임시 해결
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
        setMembers(memberData as any) // 타입 오류 임시 해결
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

  // memberIds가 변경될 때 selectedMembers 업데이트
  useEffect(() => {
    setSelectedMembers(memberIds);
  }, [memberIds]);

  // 기도방 변경시 구성원 선택 초기화
  const handleRoomChange = (value: string) => {
    onRoomChange(value)
    onMemberChange('all')
    setSelectedMembers([])
    onMemberIdsChange([])
  }

  // 구성원 선택 토글
  const toggleMember = (userId: string) => {
    let updatedMembers: string[];
    
    if (selectedMembers.includes(userId)) {
      updatedMembers = selectedMembers.filter(id => id !== userId);
    } else {
      updatedMembers = [...selectedMembers, userId];
    }
    
    setSelectedMembers(updatedMembers);
    onMemberIdsChange(updatedMembers);
  }

  // 구성원 전체 선택 / 해제
  const toggleAll = (checked: boolean) => {
    if (checked) {
      const allMemberIds = members.map(member => member.user_id);
      setSelectedMembers(allMemberIds);
      onMemberIdsChange(allMemberIds);
    } else {
      setSelectedMembers([]);
      onMemberIdsChange([]);
    }
  }

  // 기간별 기도제목만 보기 토글 처리
  const handleOnlyPeriodPrayersChange = (value: boolean) => {
    onOnlyPeriodPrayersChange(value);
    
    // 기간별 기도제목만 보기 활성화 시 개인 기도제목 포함 옵션 비활성화
    if (value && includePersonalPrayers) {
      onIncludePersonalPrayersChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>리포트 필터 설정</DialogTitle>
          <DialogDescription>리포트에 포함할 기도제목을 필터링하세요</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 기도제목 타입 선택 */}
          <div className="grid gap-2 border-b pb-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="only-period-prayers">기간별 기도제목만 보기</Label>
              <Switch 
                id="only-period-prayers" 
                checked={onlyPeriodPrayers}
                onCheckedChange={handleOnlyPeriodPrayersChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              활성화하면 공유 기도제목은 표시되지 않고 기간별 기도제목만 표시됩니다.
            </p>
          </div>

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

          {/* 구성원 선택 - 체크박스 목록으로 변경 */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>구성원</Label>
              {members.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="select-all-members"
                    checked={members.length > 0 && selectedMembers.length === members.length}
                    onCheckedChange={toggleAll}
                    disabled={roomId === 'all' || !members.length}
                  />
                  <Label htmlFor="select-all-members" className="text-xs">전체 선택</Label>
                </div>
              )}
            </div>
            
            {loadingMembers ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              roomId !== 'all' && members.length > 0 ? (
                <ScrollArea className="h-32 rounded-md border p-2">
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.user_id} className="flex items-center gap-2">
                        <Checkbox 
                          id={`member-${member.user_id}`}
                          checked={selectedMembers.includes(member.user_id)}
                          onCheckedChange={() => toggleMember(member.user_id)}
                        />
                        <Label htmlFor={`member-${member.user_id}`} className="text-sm">
                          {member.name || '이름 없음'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {roomId === 'all' 
                    ? '기도방을 선택하면 구성원을 필터링할 수 있습니다.' 
                    : '이 기도방에는 구성원이 없습니다.'}
                </p>
              )
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

          {/* 카테고리 선택 - 기간별 기도제목만 보기 옵션이 활성화되지 않은 경우에만 표시 */}
          {/* {!onlyPeriodPrayers && (
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
          )} */}

          {/* 개인 기간별 기도제목 포함 옵션 - 기간별 기도제목만 보기 옵션이 활성화되지 않은 경우에만 표시 */}
          {!onlyPeriodPrayers && (
            <div className="grid gap-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-personal-prayers">내 기간별 기도제목 포함</Label>
                <Switch 
                  id="include-personal-prayers" 
                  checked={includePersonalPrayers}
                  onCheckedChange={onIncludePersonalPrayersChange}
                />
              </div>
              
              {includePersonalPrayers && (
                <div className="mt-2">
                  <Label className="mb-2 block text-sm">기간별 기도제목 타입</Label>
                  <Tabs value={personalPrayerType} onValueChange={v => onPersonalPrayerTypeChange(v as any)} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="weekly">주간</TabsTrigger>
                      <TabsTrigger value="monthly">월간</TabsTrigger>
                      <TabsTrigger value="yearly">연간</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}
            </div>
          )}
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