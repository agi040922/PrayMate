"use client"

import { useState } from "react"
import type React from "react"
import { Plus, Lock, Globe, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CreatePrayerRoomDialog } from "@/components/features/prayer-room/create-prayer-room-dialog"

interface PrayerRoom {
  id: string
  name: string
  isPrivate: boolean
  unreadCount: number
  isActive?: boolean
}

const prayerRooms: PrayerRoom[] = [
  { id: "1", name: "가족을 위한 기도", isPrivate: true, unreadCount: 3, isActive: true },
  { id: "2", name: "교회 공동체", isPrivate: false, unreadCount: 0 },
  { id: "3", name: "선교사 중보기도", isPrivate: false, unreadCount: 5 },
  { id: "4", name: "개인 기도제목", isPrivate: true, unreadCount: 0 },
  { id: "5", name: "나라와 민족을 위한 기도", isPrivate: false, unreadCount: 2 },
]

interface PrayerRoomSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PrayerRoomSidebar({ className, ...props }: PrayerRoomSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <>
      <div
        className={cn("flex flex-col transition-all duration-300", isCollapsed ? "w-16" : "w-64", className)}
        {...props}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          {!isCollapsed && <h2 className="text-lg font-semibold">기도방 목록</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={isCollapsed ? "mx-auto" : ""}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 p-2">
            {prayerRooms.map((room) => (
              <Button
                key={room.id}
                variant={room.isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                title={isCollapsed ? room.name : undefined}
              >
                <span className="mr-2">
                  {room.isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                </span>
                {!isCollapsed && <span className="truncate">{room.name}</span>}
                {!isCollapsed && room.unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {room.unreadCount}
                  </Badge>
                )}
                {isCollapsed && room.unreadCount > 0 && (
                  <Badge variant="secondary" className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]">
                    {room.unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
            {!isCollapsed && (
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                더보기...
              </Button>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
              title={isCollapsed ? "새 기도방 생성" : undefined}
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">새 기도방 생성</span>}
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild title={isCollapsed ? "설정" : undefined}>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">설정</span>}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <CreatePrayerRoomDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
