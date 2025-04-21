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
              <div className="max-w-2xl mx-auto text-center mb-10">
                <h2 className="text-2xl font-bold text-sky-600 mb-6">프레이니에 오신 것을 환영합니다</h2>
                
                <div className="space-y-4 text-left bg-white rounded-lg shadow-md p-6 border border-sky-100">
                  <p className="text-gray-700 mb-4">
                    프레이니는 여러분의 기도 생활을 더욱 풍성하게 만들어 드립니다:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-sky-600 mr-2">•</span>
                      <p className="text-gray-700"><span className="font-semibold">기도 커뮤니티</span> - 검색창에서 "공개 기도방"을 찾아 다양한 커뮤니티에 참여하세요. <br />말씀, 기도 응답을 나누고 격려할 수 있습니다.</p>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-sky-600 mr-2">•</span>
                      <p className="text-gray-700"><span className="font-semibold">개인 기도 기록</span> - 프로필에서 기간별로 나의 모든 기도 제목을 확인할 수 있습니다.</p>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-sky-600 mr-2">•</span>
                      <p className="text-gray-700"><span className="font-semibold">기도 리포트</span> - 기도 패턴과 응답을 분석한 맞춤형 리포트를 제공합니다.</p>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-sky-600 mr-2">•</span>
                      <p className="text-gray-700"><span className="font-semibold">AI 솔루션</span> - AI가 추천하는 말씀과 기도문으로 더 깊은 기도 시간을 경험하세요.</p>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="text-sky-600 mr-2">•</span>
                      <p className="text-gray-700"><span className="font-semibold">익명 기능</span> - 익명으로 기도 제목을 나누고 중보기도를 요청할 수 있습니다.</p>
                    </div>
                  </div>
                  
                  <p className="text-center text-muted-foreground text-sm mt-4">
                    시작하려면 좌측 메뉴에서 기도방을 선택하거나 새 기도방을 만들어보세요.
                  </p>
                </div>
              </div>
              
              {/* 귀여운 양 이미지 */}
              <div className="relative w-full max-w-md h-60 mt-4">
                <div className="sheep-animation absolute">
                  <div className="sheep relative">
                    <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      {/* 양의 몸통 */}
                      <ellipse cx="100" cy="120" rx="55" ry="45" fill="#F5F5F5" />
                      <circle cx="100" cy="80" r="40" fill="#FFFFFF" />
                      
                      {/* 양의 귀 */}
                      <ellipse cx="70" cy="65" rx="15" ry="25" fill="#F5F5F5" transform="rotate(-20 70 65)" />
                      <ellipse cx="130" cy="65" rx="15" ry="25" fill="#F5F5F5" transform="rotate(20 130 65)" />
                      
                      {/* 양의 얼굴 특징 */}
                      <circle cx="85" cy="75" r="6" fill="#333333" className="sheep-eye-left" /> {/* 왼쪽 눈 */}
                      <circle cx="115" cy="75" r="6" fill="#333333" className="sheep-eye-right" /> {/* 오른쪽 눈 */}
                      
                      {/* 양의 귀여운 눈 반짝임 */}
                      <circle cx="82" cy="72" r="2" fill="#FFFFFF" />
                      <circle cx="112" cy="72" r="2" fill="#FFFFFF" />
                      
                      {/* 양의 코와 입 */}
                      <ellipse cx="100" cy="90" rx="8" ry="6" fill="#FFCCCC" />
                      <path d="M90,98 Q100,105 110,98" stroke="#666666" strokeWidth="2" fill="none" className="sheep-mouth" />
                      
                      {/* 양의 다리 */}
                      <rect x="80" y="155" width="8" height="25" rx="4" fill="#D8D8D8" className="sheep-leg-left" />
                      <rect x="115" y="155" width="8" height="25" rx="4" fill="#D8D8D8" className="sheep-leg-right" />
                    </svg>
                    
                    {/* 양이 가리키는 방향 화살표 */}
                    <div className="pointing-arrow opacity-0 absolute -top-10 left-20">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 5L5 12L12 19" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 양 애니메이션 스타일 */}
              <style jsx>{`
                .sheep-animation {
                  width: 120px;
                  height: 120px;
                  animation: sheep-movement 12s infinite;
                  transform-origin: center;
                }
                
                .sheep {
                  width: 100%;
                  height: 100%;
                  transform-origin: center;
                  animation: sheep-bounce 0.8s infinite alternate;
                }
                
                .pointing-arrow {
                  animation: arrow-appear 12s infinite;
                }
                
                .sheep-leg-left, .sheep-leg-right {
                  animation: leg-movement 0.8s infinite alternate;
                  transform-origin: top center;
                }
                
                .sheep-leg-right {
                  animation-delay: 0.4s;
                }
                
                .sheep-eye-left, .sheep-eye-right {
                  animation: blink 3s infinite;
                }
                
                .sheep-mouth {
                  animation: mouth-movement 8s infinite;
                }
                
                @keyframes sheep-movement {
                  0%, 100% { transform: translateX(30%) rotate(0deg); }
                  20% { transform: translateX(10%) rotate(5deg); }
                  30%, 45% { transform: translateX(-30%) rotate(-5deg); }
                  50%, 65% { transform: translateX(-30%) rotate(-5deg) scale(1.1); }
                  70% { transform: translateX(0%) rotate(0deg); }
                  85% { transform: translateX(20%) rotate(5deg); }
                }
                
                @keyframes sheep-bounce {
                  0% { transform: translateY(0); }
                  100% { transform: translateY(-5px); }
                }
                
                @keyframes arrow-appear {
                  0%, 30%, 70%, 100% { opacity: 0; }
                  45%, 55% { opacity: 1; }
                }
                
                @keyframes leg-movement {
                  0% { transform: rotate(-5deg); }
                  100% { transform: rotate(5deg); }
                }
                
                @keyframes blink {
                  0%, 48%, 52%, 100% { transform: scaleY(1); }
                  50% { transform: scaleY(0.1); }
                }
                
                @keyframes mouth-movement {
                  0%, 45%, 55%, 100% { d: path('M90,98 Q100,105 110,98'); }
                  50% { d: path('M90,98 Q100,95 110,98'); }
                }
                
                /* 반응형 조정 */
                @media (min-width: 640px) {
                  .sheep-animation {
                    width: 150px;
                    height: 150px;
                  }
                }
                
                @media (min-width: 1024px) {
                  .sheep-animation {
                    width: 180px;
                    height: 180px;
                  }
                }
              `}</style>
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
