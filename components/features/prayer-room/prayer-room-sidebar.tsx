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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { PrayerRoomList } from "@/components/features/prayer-room/prayer-room-list"
import { JoinRoomForm } from "@/components/features/prayer-room/join-room-form"
import { CreateRoomForm } from "@/components/features/prayer-room/create-room-form"
import { ManageRoomForm } from "@/components/features/prayer-room/manage-room-form"
import { ViewMembersForm } from "@/components/features/prayer-room/view-members-form"

interface PrayerRoomSidebarProps {
  className?: string
  onSelect?: (roomId: string) => void
}

export function PrayerRoomSidebar({ className, onSelect }: PrayerRoomSidebarProps) {
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openManageDialog, setOpenManageDialog] = useState(false)
  const [openSearchDialog, setOpenSearchDialog] = useState(false)
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showManageForm, setShowManageForm] = useState(false)
  const [showMembersForm, setShowMembersForm] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
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
    
    // 검색 다이얼로그 닫기
    setOpenSearchDialog(false)
  }

  // 기도방 관리 모달 열기
  const handleManageRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowManageForm(true)
  }

  // 기도방 멤버 확인 모달 열기
  const handleViewMembers = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowMembersForm(true)
  }

  // 기도방 선택 처리
  const handleSelectRoom = (roomId: string) => {
    if (onSelect) {
      onSelect(roomId)
    }
    closeSidebar()
  }

  // 사이드바 닫기 함수
  const closeSidebar = () => {
    setIsSheetOpen(false)
  }

  return (
    <>
      {/* 모바일 사이드바 - Sheet 컴포넌트로 구현 */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <div className={cn("flex h-full flex-col", className)}>
            <SheetHeader className="p-4 border-b">
              <SheetTitle>내 기도방</SheetTitle>
            </SheetHeader>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  기도방 생성
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowJoinForm(true)}
                >
                  참여하기
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="기도방 검색..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <PrayerRoomList 
                onManageRoom={handleManageRoom} 
                onViewMembers={handleViewMembers}
                onSelectRoom={handleSelectRoom}
                closeSidebar={closeSidebar}
              />
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* 데스크톱 사이드바 */}
      <div className={cn("flex h-full flex-col", className)}>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              기도방 생성
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowJoinForm(true)}
            >
              참여하기
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="기도방 검색..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <PrayerRoomList 
            onManageRoom={handleManageRoom} 
            onViewMembers={handleViewMembers} 
            onSelectRoom={onSelect}
          />
        </ScrollArea>
      </div>

      {/* 기도방 생성 폼 */}
      {showCreateForm && (
        <CreateRoomForm
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* 기도방 참여 폼 */}
      {showJoinForm && (
        <JoinRoomForm
          onClose={() => setShowJoinForm(false)}
        />
      )}

      {/* 기도방 관리 폼 */}
      {showManageForm && selectedRoomId && (
        <ManageRoomForm
          roomId={selectedRoomId}
          onClose={() => {
            setShowManageForm(false)
            setSelectedRoomId(null)
          }}
        />
      )}

      {/* 기도방 멤버 확인 폼 */}
      {showMembersForm && selectedRoomId && (
        <ViewMembersForm
          roomId={selectedRoomId}
          onClose={() => {
            setShowMembersForm(false)
            setSelectedRoomId(null)
          }}
        />
      )}
    </>
  )
}
