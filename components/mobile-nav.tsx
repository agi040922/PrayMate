import { Menu } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { PrayerRoomSidebar } from "@/components/prayer-room-sidebar"

export function MobileNav() {
  return (
    <div className="flex md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-left">기도모아</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="작성자/키워드/성경구절" className="w-full rounded-lg pl-8" />
            </div>
            <div className="grid gap-2">
              <Link href="/prayer-rooms">
                <Button variant="ghost" className="w-full justify-start">
                  기도방
                </Button>
              </Link>
              <Link href="/register-prayer">
                <Button variant="ghost" className="w-full justify-start">
                  기도제목 등록
                </Button>
              </Link>
              <Link href="/response-management">
                <Button variant="ghost" className="w-full justify-start">
                  응답관리
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost" className="w-full justify-start">
                  리포트 다운로드
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 overflow-auto border-t">
            <PrayerRoomSidebar className="border-none" />
          </div>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="text-xl font-bold text-sky-600">기도모아</span>
      </Link>
    </div>
  )
}
