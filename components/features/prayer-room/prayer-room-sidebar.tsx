"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ManagePrayerRoomDialog } from "@/components/features/prayer-room/create-prayer-room-dialog"
import { CreatePrayerRoomDialog } from "@/components/features/prayer-room/real-create-prayer-room-dialog"
import { getUserPrayerRooms } from "@/lib/supabase/prayer-rooms"
import { useAuth } from "@/lib/context/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search } from "lucide-react"
import { PrayerRoomSearch } from "./prayer-room-search"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface PrayerRoomSidebarProps {
  className?: string
  onSelect?: (roomId: string) => void
}

export function PrayerRoomSidebar({ className, onSelect }: PrayerRoomSidebarProps) {
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openManageDialog, setOpenManageDialog] = useState(false)
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()
  
  const fetchRooms = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      const data = await getUserPrayerRooms(user.id)
      setRooms(data || [])
    } catch (error) {
      console.error("기도방 목록 로딩 실패:", error)
      toast({
        title: "기도방 목록 로딩 실패",
        description: "기도방 목록을 불러오는데 문제가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchRooms()
  }, [user, toast])
  
  const handleRoomClick = (roomId: string) => {
    setSelectedRoomId(roomId)
    if (onSelect) {
      onSelect(roomId)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    await fetchRooms() // 기도방 목록 새로고침
    
    // 방금 참여한 기도방 선택
    setSelectedRoomId(roomId)
    if (onSelect) {
      onSelect(roomId)
    }
    
    // 검색 패널 닫기
    setIsSearchOpen(false)
  }

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="px-2 text-lg font-semibold tracking-tight">내 기도방</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="기도방 검색"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 검색 컴포넌트 */}
          <Collapsible open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <CollapsibleContent className="mb-4">
              <div className="border rounded-md p-2 bg-background/50">
                <PrayerRoomSearch onJoin={handleJoinRoom} />
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="space-y-1">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => setOpenCreateDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              새 기도방 만들기
            </Button>
          </div>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">참여 중인 기도방</h2>
          {loading ? (
            <div className="flex justify-center py-4">
              <p className="text-sm text-muted-foreground">로딩 중...</p>
            </div>
          ) : rooms.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-1">
                {rooms.map((room) => (
                  <Button
                    key={room.room_id}
                    variant={selectedRoomId === room.room_id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-1",
                      selectedRoomId === room.room_id && "bg-accent"
                    )}
                    onClick={() => handleRoomClick(room.room_id)}
                  >
                    <div className="truncate">{room.title}</div>
                    {room.role === "admin" && (
                      <Badge variant="outline" className="ml-auto">관리자</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex justify-center py-4">
              <p className="text-sm text-muted-foreground">참여 중인 기도방이 없습니다</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 기도방 관리 다이얼로그는 선택된 기도방과 관리자 권한이 있을 때만 표시 */}
      {selectedRoomId && (
        <ManagePrayerRoomDialog 
          open={openManageDialog} 
          onOpenChange={setOpenManageDialog}
          roomId={selectedRoomId}
        />
      )}
      
      {/* 기도방 생성 다이얼로그 */}
      <CreatePrayerRoomDialog 
        open={openCreateDialog} 
        onOpenChange={setOpenCreateDialog} 
      />
    </div>
  )
}
