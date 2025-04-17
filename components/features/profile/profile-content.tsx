"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PrayerRequestList } from "@/components/features/prayer-request/prayer-request-list"
import { YearlyPrayerList } from "@/components/features/prayer-request/yearly-prayer-list"
import { PrayerRoomList } from "@/components/features/prayer-room/prayer-room-list"
import { 
  Pencil, 
  LogOut, 
  Bell, 
  Clock, 
  Calendar, 
  CalendarDays,
  PlusCircle, 
  CheckCircle, 
  BookOpen, 
  MessageCircle, 
  HeartHandshake 
} from "lucide-react"
import Link from "next/link"
import { ManagePrayerRoomDialog } from "@/components/features/prayer-room/manage-prayer-room-dialog"
import { CreatePrayerRoomDialog } from "@/components/features/prayer-room/real-create-prayer-room-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProfile } from "@/lib/context/ProfileContext"
import { useAuth } from "@/lib/context/AuthContext"
import { signOut, getUserProfile } from "@/lib/supabase/users"
import { useToast } from "@/components/ui/use-toast"
import { PrayerRequestCard } from "./cards/prayer-request-card"
import { ProfileEditDialog } from "./dialogs/profile-edit-dialog"

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState("my-prayers")
  const [showManageDialog, setShowManageDialog] = useState(false)
  const [showProfileEditDialog, setShowProfileEditDialog] = useState(false)
  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prayerFilter, setPrayerFilter] = useState<"all" | "answered" | "unanswered">("all")
  const { toast } = useToast()
  
  const { 
    userPrayerRequests,
    answeredPrayerRequests,
    loadingPrayerRequests,
    userRooms, 
    selectedRoomId, 
    setSelectedRoomId, 
    weeklyPrayers, 
    monthlyPrayers, 
    yearlyPrayers,
    refreshPeriodPrayers,
    refreshPrayerRequests
  } = useProfile()
  
  const { user } = useAuth()
  
  // 사용자 프로필 정보 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        const profile = await getUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error("사용자 프로필 로드 실패:", error)
        toast({
          title: "프로필 로드 실패",
          description: "사용자 프로필을 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserProfile()
  }, [user, toast])

  const handleManageRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowManageDialog(true)
  }
  
  const handleViewMembers = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowManageDialog(true)
  }
  
  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "로그아웃 성공",
        description: "성공적으로 로그아웃되었습니다."
      })
      
      // 로그인 페이지로 리디렉션
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("로그아웃 실패:", error)
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }
  
  // 사용자 프로필 이미지의 이니셜 생성
  const getInitials = () => {
    if (!userProfile || !userProfile.name) return "익명"
    
    return userProfile.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
  }

  // 필터링된 기도제목 가져오기
  const getFilteredPrayers = () => {
    if (prayerFilter === "answered") {
      return answeredPrayerRequests;
    } else if (prayerFilter === "unanswered") {
      return userPrayerRequests;
    } else {
      return [...userPrayerRequests, ...answeredPrayerRequests].sort(
        (a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        }
      );
    }
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <p>프로필 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* 프로필 헤더 섹션 */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={userProfile?.avatar_url || "/placeholder-user.jpg"} alt="프로필 이미지" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{userProfile?.name || "이름 미설정"}</h1>
            <p className="text-muted-foreground">{userProfile?.email || user?.email || "이메일 미설정"}</p>
            <div className="mt-2 flex gap-2">
              {/* 프로필 편집 버튼 */}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => setShowProfileEditDialog(true)}
              >
                <Pencil className="mr-2 h-3 w-3" />
                프로필 편집
              </Button>
              {/* 로그아웃 버튼 */}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-3 w-3" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* 알림 버튼 - 알림 페이지로 이동 */}
          <Button variant="outline" asChild>
            <Link href="/notifications">
              <Bell className="mr-2 h-4 w-4" />
              알림
            </Link>
          </Button>
        </div>
      </div>

      {/* 프로필 콘텐츠 탭 */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          {/* 내 기도제목 탭 */}
          <TabsTrigger value="my-prayers">내 기도제목</TabsTrigger>
          {/* 기간별 기도제목 탭 */}
          <TabsTrigger value="time-prayers">기간별 기도제목</TabsTrigger>
          {/* 내 기도방 탭 */}
          <TabsTrigger value="my-rooms">내 기도방</TabsTrigger>
        </TabsList>

        {/* 내 기도제목 탭 콘텐츠 */}
        <TabsContent value="my-prayers" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">내가 작성한 기도제목</h2>
            <div className="flex items-center gap-2">
              <Select 
                defaultValue={prayerFilter} 
                onValueChange={(value: "all" | "answered" | "unanswered") => setPrayerFilter(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="전체 기도제목" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 기도제목</SelectItem>
                  <SelectItem value="answered">응답된 기도</SelectItem>
                  <SelectItem value="unanswered">응답 대기중</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                defaultValue={selectedRoomId || "all"} 
                onValueChange={(value) => setSelectedRoomId(value === "all" ? null : value)}
              >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="모든 기도방" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 기도방</SelectItem>
                  {userRooms.map(room => (
                    <SelectItem key={room.room_id} value={room.room_id}>
                      {room.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            </div>
          </div>

          {/* 내가 작성한 기도제목 목록 */}
          {loadingPrayerRequests ? (
            <div className="text-center p-4">기도제목을 불러오는 중...</div>
          ) : getFilteredPrayers().length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              {prayerFilter === "answered" ? "응답된 기도제목이 없습니다." :
               prayerFilter === "unanswered" ? "응답 대기중인 기도제목이 없습니다." :
               "작성된 기도제목이 없습니다."}
            </div>
          ) : (
            <div className="space-y-1">
              {getFilteredPrayers().map((prayer) => (
                <PrayerRequestCard 
                  key={prayer.request_id} 
                  prayer={prayer} 
                  showActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 기간별 기도제목 탭 콘텐츠 */}
        <TabsContent value="time-prayers" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* 주간 기도제목 카드 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">주간 기도제목</CardTitle>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>이번 주 집중할 기도제목</CardDescription>
              </CardHeader>
              <CardContent>
                <YearlyPrayerList type="weekly" prayers={weeklyPrayers} onUpdate={refreshPeriodPrayers} />
                {/* 주간 기도제목 추가 버튼 */}
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => {
                    // 기도제목 작성 다이얼로그 표시 로직 필요
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  주간 기도제목 작성
                </Button>
              </CardContent>
            </Card>

            {/* 월간 기도제목 카드 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">월간 기도제목</CardTitle>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>이번 달 집중할 기도제목</CardDescription>
              </CardHeader>
              <CardContent>
                <YearlyPrayerList type="monthly" prayers={monthlyPrayers} onUpdate={refreshPeriodPrayers} />
                {/* 월간 기도제목 추가 버튼 */}
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => {
                    // 기도제목 작성 다이얼로그 표시 로직 필요
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  월간 기도제목 작성
                </Button>
              </CardContent>
            </Card>

            {/* 연간 기도제목 카드 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">연간 기도제목</CardTitle>
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>올해 집중할 기도제목</CardDescription>
              </CardHeader>
              <CardContent>
                <YearlyPrayerList type="yearly" prayers={yearlyPrayers} onUpdate={refreshPeriodPrayers} />
                {/* 연간 기도제목 추가 버튼 */}
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => {
                    // 기도제목 작성 다이얼로그 표시 로직 필요
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  연간 기도제목 작성
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 내 기도방 탭 콘텐츠 */}
        <TabsContent value="my-rooms" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">내가 참여 중인 기도방</h2>
            {/* 새 기도방 생성 버튼 */}
            <Button onClick={() => setShowCreateRoomDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />새 기도방 생성
            </Button>
          </div>
          {/* 내가 참여 중인 기도방 목록 */}
          <PrayerRoomList 
            onManageRoom={handleManageRoom} 
            onViewMembers={handleViewMembers} 
          />
        </TabsContent>
      </Tabs>

      {/* 기도방 관리 다이얼로그 */}
      {selectedRoomId && (
        <ManagePrayerRoomDialog 
          open={showManageDialog} 
          onOpenChange={setShowManageDialog} 
          roomId={selectedRoomId} 
          isAdmin={userRooms.find(room => room.room_id === selectedRoomId)?.role === "admin"}
        />
      )}
      
      {/* 프로필 편집 다이얼로그 */}
      <ProfileEditDialog 
        open={showProfileEditDialog} 
        onOpenChange={setShowProfileEditDialog} 
      />

      {/* 기도방 생성 다이얼로그 */}
      <CreatePrayerRoomDialog
        open={showCreateRoomDialog}
        onOpenChange={setShowCreateRoomDialog}
      />
    </div>
  )
} 