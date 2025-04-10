"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PrayerRequestList } from "@/components/features/prayer-request/prayer-request-list"
import { PrayerRequestForm } from "@/components/features/prayer-request/prayer-request-form"
import { PrayerRoomSidebar } from "@/components/features/prayer-room/prayer-room-sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, LayoutGrid, List, Menu, Bell, User, Download, Search, Settings, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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

export default function PrayerRoomPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"card" | "list" | "compact">("card")
  
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  
  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])
  
  // 로그아웃 처리
  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "로그아웃 성공",
        description: "성공적으로 로그아웃되었습니다.",
      })
      router.push("/login")
    } catch (error) {
      console.error(error)
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
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
          <span className="text-xl font-bold text-sky-600">기도모아</span>
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
            <PrayerRoomSidebar className="h-full" />
          </SheetContent>
        </Sheet>

        <div className="flex-1 md:text-center">
          <h1 className="text-lg font-semibold md:text-xl">가족을 위한 기도방</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 검색창 */}
          <div className="relative hidden md:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="검색" className="w-64 rounded-lg pl-8" />
          </div>

          {/* 알림 버튼 */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {/* 읽지 않은 알림이 있는 경우 표시 */}
              <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]">3</Badge>
              <span className="sr-only">알림</span>
            </Link>
          </Button>

          {/* 프로필 버튼 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">프로필</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/profile" passHref legacyBehavior>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>내 프로필</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings" passHref legacyBehavior>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Sidebar - Prayer Rooms */}
        <PrayerRoomSidebar className="hidden border-r md:block md:w-64" />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-4xl">
            {/* Room Description */}
            <div className="mb-6 hidden md:block">
              <p className="text-muted-foreground">우리 가족을 위한 기도제목을 나누는 공간입니다.</p>
            </div>

            {/* Filters and View Options */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="relative sm:hidden">
                  <Input type="search" placeholder="검색" className="w-full" />
                </div>
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
            <PrayerRequestList category={selectedCategory} viewMode={viewMode} />

            {/* Reports Button - 추가된 부분 */}
            <Button variant="outline" className="fixed bottom-24 right-6 shadow-md" asChild>
              <Link href="/reports">
                <Download className="mr-2 h-4 w-4" />
                리포트
              </Link>
            </Button>

            {/* Add Prayer Request Button */}
            <Button
              onClick={() => setShowForm(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
              size="icon"
            >
              <PlusIcon className="h-6 w-6" />
            </Button>

            {/* Prayer Request Form */}
            {showForm && <PrayerRequestForm onClose={() => setShowForm(false)} />}
          </div>
        </main>
      </div>
    </div>
  )
}
