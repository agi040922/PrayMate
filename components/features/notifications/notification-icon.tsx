"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NotificationList } from "@/components/features/notifications/notification-list"
import { useAuth } from "@/lib/context/AuthContext"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"

interface NotificationIconProps {
  className?: string
}

export function NotificationIcon({ className }: NotificationIconProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  
  const { user } = useAuth()
  
  // 읽지 않은 알림 개수 가져오기
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return
      
      try {
        const count = await getUnreadNotificationCount(user.id)
        setUnreadCount(count)
      } catch (error) {
        console.error("알림 개수 로딩 실패:", error)
      }
    }
    
    fetchUnreadCount()
    
    // 일정 시간마다 알림 개수 새로고침
    const interval = setInterval(fetchUnreadCount, 60000) // 1분마다 갱신
    
    return () => clearInterval(interval)
  }, [user])
  
  // 알림 패널이 닫힐 때 알림 개수 다시 가져오기
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    
    // 패널이 닫힐 때 알림 개수 다시 가져오기
    if (!newOpen && user) {
      const fetchCount = async () => {
        try {
          const count = await getUnreadNotificationCount(user.id)
          setUnreadCount(count)
        } catch (error) {
          console.error("알림 개수 로딩 실패:", error)
        }
      }
      
      // 약간의 지연 후 실행하여 서버에 최신 상태가 반영되게 함
      setTimeout(fetchCount, 500)
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
            <span className="sr-only">알림</span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>알림</SheetTitle>
        </SheetHeader>
        <NotificationList />
      </SheetContent>
    </Sheet>
  )
} 