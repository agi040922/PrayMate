"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PrayerRequestList } from "@/components/features/prayer-request/prayer-request-list"
import { PrayerRequestForm } from "@/components/features/prayer-request/prayer-request-form"
import { PrayerRoomSidebar } from "@/components/features/prayer-room/prayer-room-sidebar"
import { RoomSummary } from "@/components/features/prayer-room/room-summary"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, LayoutGrid, List, Menu, Bell, User, Download, Search, Settings, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/context/AuthContext"
import { signOut } from "@/lib/supabase/users"
import { useToast } from "@/components/ui/use-toast"
import { getPrayerRoomDetails } from "@/lib/supabase/prayer-rooms"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"

export default function PrayerRoomPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"card" | "list" | "compact">("card")
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0)
  
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  
  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])
  
  // 선택한 기도방 상세 정보 가져오기
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!selectedRoomId) {
        setSelectedRoom(null)
        return
      }
      
      try {
        setIsLoading(true)
        const roomData = await getPrayerRoomDetails(selectedRoomId)
        setSelectedRoom(roomData)
      } catch (error) {
        console.error("기도방 정보 로딩 실패:", error)
        toast({
          title: "기도방 정보 로딩 실패",
          description: "기도방 정보를 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRoomDetails()
  }, [selectedRoomId, toast])
  
  // 읽지 않은 알림 개수 가져오기
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return
      
      try {
        const count = await getUnreadNotificationCount(user.id)
        setUnreadNotificationCount(count)
      } catch (error) {
        console.error("알림 개수 조회 실패:", error)
      }
    }
    
    // 초기 로드 시 알림 개수 조회
    fetchUnreadCount()
    
    // 30초마다 알림 개수 갱신
    const intervalId = setInterval(fetchUnreadCount, 30000)
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId)
  }, [user])
  
  // 로그아웃 처리
  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "로그아웃 성공",
        description: "성공적으로 로그아웃되었습니다.",
      })
      router.push("/")
    } catch (error) {
      console.error(error)
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }
  
  // 기도방 선택 처리
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId)
  }
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="hidden md:flex">
          <span className="text-xl font-bold text-sky-600">프레이니</span>
        </div>

        {/* Mobile Sidebar Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <PrayerRoomSidebar className="h-full" onSelect={handleRoomSelect} />
            <SheetTitle>사이드바 열기</SheetTitle>
          </SheetContent>
        </Sheet>

        <div className="flex-1 md:text-center">
          <h1 className="text-lg font-semibold md:text-xl">
            {selectedRoom ? selectedRoom.title : "내 기도방"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 검색창 */}
          {/* <div className="relative hidden md:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="검색" className="w-64 rounded-lg pl-8" />
          </div> */}

          {/* 알림 버튼 */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {/* 읽지 않은 알림이 있는 경우 표시 */}
              {unreadNotificationCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Badge>
              )}
              <span className="sr-only">알림</span>
            </Link>
          </Button>

          {/* 프로필 버튼 */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">프로필</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Sidebar - Prayer Rooms */}
        <PrayerRoomSidebar className="hidden border-r md:block md:w-64" onSelect={handleRoomSelect} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6">
          {selectedRoomId ? (
            <div className="mx-auto max-w-4xl">
              {/* 선택된 기도방 정보 */}
              <div className="mb-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <p>기도방 정보를 불러오는 중...</p>
                  </div>
                ) : (
                  <>
                    {/* 기도방 요약 정보 */}
                    <RoomSummary roomId={selectedRoomId} />
                    
                    {/* Filters and View Options */}
                    <div className="my-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="카테고리" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="personal">개인</SelectItem>
                            <SelectItem value="community">공동체</SelectItem>
                            <SelectItem value="thanksgiving">감사</SelectItem>
                            <SelectItem value="intercession">중보기도</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* <div className="relative sm:hidden">
                          <Input type="search" placeholder="검색" className="w-full" />
                        </div> */}
                      </div>

                      <div className="flex items-center gap-2">
                        <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                          <TabsList>
                            <TabsTrigger value="card">
                              <LayoutGrid className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="list">
                              <List className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="compact">
                              <span className="text-xs">제목만</span>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>

                    {/* Prayer Request List */}
                    <PrayerRequestList 
                      roomId={selectedRoomId} 
                      category={selectedCategory} 
                      viewMode={viewMode} 
                    />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="mb-4 text-center text-muted-foreground">좌측 메뉴에서 기도방을 선택하세요</p>
            </div>
          )}

          {/* Reports Button */}
          <Button variant="outline" className="fixed bottom-24 right-6 shadow-md" asChild>
            <Link href="/reports">
              <Download className="mr-2 h-4 w-4" />
              리포트
            </Link>
          </Button>

          {/* Add Prayer Request Button - 기도방이 선택되었을 때만 표시 */}
          {selectedRoomId && (
            <Button
              onClick={() => setShowForm(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
              size="icon"
            >
              <PlusIcon className="h-6 w-6" />
            </Button>
          )}

          {/* Prayer Request Form */}
          {showForm && selectedRoomId && (
            <PrayerRequestForm 
              roomId={selectedRoomId} 
              onClose={() => setShowForm(false)} 
            />
          )}
        </main>
      </div>
    </div>
  )
}
