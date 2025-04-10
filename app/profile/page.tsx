"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PrayerRequestList } from "@/components/prayer-request-list"
import { YearlyPrayerList } from "@/components/yearly-prayer-list"
import { PrayerRoomList } from "@/components/prayer-room-list"
import { Pencil, LogOut, Bell, Clock, Calendar, CalendarDays } from "lucide-react"
import Link from "next/link"
import { ManagePrayerRoomDialog } from "@/components/manage-prayer-room-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("my-prayers")
  const [showManageDialog, setShowManageDialog] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const handleManageRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowManageDialog(true)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* 프로필 헤더 섹션 */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src="/placeholder-user.jpg" alt="프로필 이미지" />
            <AvatarFallback>김성실</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">김성실</h1>
            <p className="text-muted-foreground">sincere@example.com</p>
            <div className="mt-2 flex gap-2">
              {/* 프로필 편집 버튼 */}
              <Button variant="outline" size="sm" className="h-8">
                <Pencil className="mr-2 h-3 w-3" />
                프로필 편집
              </Button>
              {/* 로그아웃 버튼 */}
              <Button variant="outline" size="sm" className="h-8">
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
        <TabsList className="mb-6 grid w-full grid-cols-4">
          {/* 내 기도제목 탭 */}
          <TabsTrigger value="my-prayers">내 기도제목</TabsTrigger>
          {/* 기간별 기도제목 탭 */}
          <TabsTrigger value="time-prayers">기간별 기도제목</TabsTrigger>
          {/* 내 기도방 탭 */}
          <TabsTrigger value="my-rooms">내 기도방</TabsTrigger>
          {/* 응답된 기도 탭 */}
          <TabsTrigger value="answered-prayers">응답된 기도</TabsTrigger>
        </TabsList>

        {/* 내 기도제목 탭 콘텐츠 */}
        <TabsContent value="my-prayers" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">내가 작성한 기도제목</h2>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="모든 기도방" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 기도방</SelectItem>
                <SelectItem value="family">가족을 위한 기도</SelectItem>
                <SelectItem value="church">교회 공동체</SelectItem>
                <SelectItem value="mission">선교사 중보기도</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* 내가 작성한 기도제목 목록 */}
          <PrayerRequestList category="all" viewMode="list" showManageButtons={true} />
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
                <YearlyPrayerList type="weekly" />
                {/* 주간 기도제목 추가 버튼 */}
                <Button variant="outline" className="mt-4 w-full">
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
                <YearlyPrayerList type="monthly" />
                {/* 월간 기도제목 추가 버튼 */}
                <Button variant="outline" className="mt-4 w-full">
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
                <YearlyPrayerList type="yearly" />
                {/* 연간 기도제목 추가 버튼 */}
                <Button variant="outline" className="mt-4 w-full">
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
            <Button>
              <Pencil className="mr-2 h-4 w-4" />새 기도방 생성
            </Button>
          </div>
          {/* 내가 참여 중인 기도방 목록 */}
          <PrayerRoomList onManageRoom={handleManageRoom} />
        </TabsContent>

        {/* 응답된 기도 탭 콘텐츠 */}
        <TabsContent value="answered-prayers" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">응답된 기도제목</h2>
            <p className="text-muted-foreground">하나님의 응답하심에 감사드립니다.</p>
          </div>
          {/* 응답된 기도제목 목록 */}
          <PrayerRequestList category="all" viewMode="list" answeredOnly={true} />
        </TabsContent>
      </Tabs>

      {/* 기도방 관리 다이얼로그 */}
      {selectedRoomId && (
        <ManagePrayerRoomDialog open={showManageDialog} onOpenChange={setShowManageDialog} roomId={selectedRoomId} />
      )}
    </div>
  )
}
