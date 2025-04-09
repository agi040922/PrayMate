"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, Heart, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// 알림 타입 정의
interface Notification {
  id: string
  type: "comment" | "prayer" | "answer" | "invite" | "system"
  title: string
  content: string
  date: string
  isRead: boolean
  user?: {
    name: string
    avatar: string
  }
  prayerRoom?: string
  prayerTitle?: string
}

// 샘플 알림 데이터
const notifications: Notification[] = [
  {
    id: "1",
    type: "comment",
    title: "새 댓글이 달렸습니다",
    content: "박은혜님이 당신의 기도제목에 댓글을 남겼습니다: '함께 기도하겠습니다. 속히 회복되시길 바랍니다.'",
    date: "2023-04-10 14:30",
    isRead: false,
    user: {
      name: "박은혜",
      avatar: "",
    },
    prayerRoom: "가족을 위한 기도",
    prayerTitle: "아버지의 건강 회복을 위해 기도해주세요",
  },
  {
    id: "2",
    type: "prayer",
    title: "함께 기도합니다",
    content: "이소망님이 당신의 기도제목에 함께 기도하고 있습니다.",
    date: "2023-04-09 11:15",
    isRead: true,
    user: {
      name: "이소망",
      avatar: "",
    },
    prayerRoom: "가족을 위한 기도",
    prayerTitle: "아버지의 건강 회복을 위해 기도해주세요",
  },
  {
    id: "3",
    type: "answer",
    title: "기도 응답이 등록되었습니다",
    content: "박소망님이 '선교사님들의 안전과 사역을 위해' 기도제목에 응답을 기록했습니다.",
    date: "2023-04-08 09:45",
    isRead: false,
    user: {
      name: "박소망",
      avatar: "",
    },
    prayerRoom: "선교사 중보기도",
    prayerTitle: "선교사님들의 안전과 사역을 위해",
  },
  {
    id: "4",
    type: "invite",
    title: "기도방 초대",
    content: "정은혜님이 '청년부 기도모임' 기도방에 초대했습니다.",
    date: "2023-04-07 16:20",
    isRead: true,
    user: {
      name: "정은혜",
      avatar: "",
    },
    prayerRoom: "청년부 기도모임",
  },
  {
    id: "5",
    type: "system",
    title: "시스템 알림",
    content: "기도모아 서비스가 업데이트 되었습니다. 새로운 기능을 확인해보세요!",
    date: "2023-04-06 10:00",
    isRead: true,
  },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [notificationList, setNotificationList] = useState<Notification[]>(notifications)

  // 알림을 읽음 처리하는 함수
  const markAsRead = (id: string) => {
    setNotificationList(
      notificationList.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    )
  }

  // 모든 알림을 읽음 처리하는 함수
  const markAllAsRead = () => {
    setNotificationList(notificationList.map((notification) => ({ ...notification, isRead: true })))
  }

  // 필터링된 알림 목록
  const filteredNotifications =
    activeTab === "all" ? notificationList : notificationList.filter((notification) => !notification.isRead)

  // 알림 아이콘 렌더링 함수
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "prayer":
        return <Heart className="h-5 w-5 text-red-500" />
      case "answer":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "invite":
        return <Bell className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* 알림 페이지 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 뒤로가기 버튼 */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prayer-room">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">알림</h1>
        </div>
        {/* 모두 읽음 처리 버튼 */}
        <Button variant="outline" onClick={markAllAsRead}>
          모두 읽음 처리
        </Button>
      </div>

      {/* 알림 탭 */}
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "unread")}>
        <div className="flex items-center justify-between">
          <TabsList>
            {/* 전체 알림 탭 */}
            <TabsTrigger value="all">전체 알림</TabsTrigger>
            {/* 읽지 않은 알림 탭 */}
            <TabsTrigger value="unread">
              읽지 않은 알림
              {notificationList.filter((n) => !n.isRead).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notificationList.filter((n) => !n.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 알림 목록 */}
        <TabsContent value="all" className="mt-6">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">알림이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`overflow-hidden transition-colors ${
                    !notification.isRead ? "border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {renderNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">{notification.date}</span>
                        </div>
                        <p className="mt-1 text-sm">{notification.content}</p>
                        {notification.prayerRoom && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.prayerRoom}
                            </Badge>
                            {notification.prayerTitle && (
                              <span className="ml-2 text-xs text-muted-foreground">{notification.prayerTitle}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">읽지 않은 알림이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="overflow-hidden border-l-4 border-l-primary"
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {renderNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground">{notification.date}</span>
                        </div>
                        <p className="mt-1 text-sm">{notification.content}</p>
                        {notification.prayerRoom && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.prayerRoom}
                            </Badge>
                            {notification.prayerTitle && (
                              <span className="ml-2 text-xs text-muted-foreground">{notification.prayerTitle}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
