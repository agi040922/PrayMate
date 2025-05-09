"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  MessageSquare, 
  Heart, 
  CheckCircle, 
  ArrowLeft, 
  Trash2,
  User,
  Filter
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import { 
  Notification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification
} from "@/lib/supabase/notifications"

interface NotificationListProps {
  onBackClick?: () => void
}

// 알림 타입 정의 (notifications 테이블의 type 값에 맞춤)
type NotificationType = "comment" | "prayer" | "answer" | "invite" | "system" | "all";

// 알림 타입 표시 정보
const notificationTypeInfo = {
  all: { label: "전체", icon: <Bell className="h-4 w-4" /> },
  comment: { label: "댓글", icon: <MessageSquare className="h-4 w-4 text-blue-500" /> },
  prayer: { label: "기도", icon: <Heart className="h-4 w-4 text-red-500" /> },
  answer: { label: "응답", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  invite: { label: "초대", icon: <User className="h-4 w-4 text-purple-500" /> },
  system: { label: "시스템", icon: <Bell className="h-4 w-4 text-gray-500" /> }
};

export function NotificationList({ onBackClick }: NotificationListProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [activeType, setActiveType] = useState<NotificationType>("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteAlertId, setDeleteAlertId] = useState<string | null>(null)
  
  const { toast } = useToast()
  const { user } = useAuth()

  // 알림 목록 조회
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        const options = activeTab === "unread" ? { unreadOnly: true } : undefined
        const data = await getUserNotifications(user.id, options)
        setNotifications(data || [])
      } catch (error) {
        console.error("알림 목록 로딩 실패:", error)
        toast({
          title: "알림 로딩 실패",
          description: "알림 목록을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchNotifications()
  }, [user, activeTab, toast])

  // 알림 타입 필터링 처리
  useEffect(() => {
    if (activeType === "all") {
      setFilteredNotifications(notifications)
    } else {
      setFilteredNotifications(
        notifications.filter(notification => notification.type === activeType)
      )
    }
  }, [notifications, activeType])

  // 알림 읽음 처리
  const handleReadNotification = async (id: string) => {
    if (!user) return
    
    try {
      await markNotificationAsRead(id)
      
      // 로컬 상태 업데이트
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.notification_id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      )
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error)
    }
  }

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    if (!user) return
    
    try {
      await markAllNotificationsAsRead(user.id)
      
      // 로컬 상태 업데이트
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          is_read: true
        }))
      )
      
      toast({
        title: "모든 알림 읽음 처리 완료",
        description: "모든 알림이 읽음 처리 되었습니다."
      })
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error)
      toast({
        title: "읽음 처리 실패",
        description: "알림을 읽음 처리하는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 알림 삭제
  const handleDeleteNotification = async (id: string) => {
    if (!user) return
    
    try {
      await deleteNotification(id)
      
      // 로컬 상태 업데이트
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.notification_id !== id)
      )
      
      toast({
        title: "알림 삭제 완료",
        description: "알림이 삭제되었습니다."
      })
    } catch (error) {
      console.error("알림 삭제 실패:", error)
      toast({
        title: "삭제 실패",
        description: "알림을 삭제하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setDeleteAlertId(null)
    }
  }

  // 알림 아이콘 렌더링
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "prayer":
        return <Heart className="h-5 w-5 text-red-500" />
      case "answer":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "invite":
        return <User className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // 타입별 알림 개수 계산
  const getCountByType = (type: NotificationType) => {
    if (type === "all") return notifications.length;
    return notifications.filter(notification => notification.type === type).length;
  }

  // 읽지 않은 알림 개수 계산
  const getUnreadCountByType = (type: NotificationType) => {
    if (type === "all") return notifications.filter(n => !n.is_read).length;
    return notifications.filter(n => n.type === type && !n.is_read).length;
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">알림을 불러오는 중...</div>
  }

  return (
    <div className="space-y-4">
      {/* 알림 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBackClick && (
            <Button variant="ghost" size="icon" onClick={onBackClick}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">뒤로 가기</span>
            </Button>
          )}
          <h1 className="text-2xl font-bold">알림</h1>
          
          {/* 알림 타입 필터 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2 flex items-center gap-1">
                {notificationTypeInfo[activeType].icon}
                <span>{notificationTypeInfo[activeType].label}</span>
                <Filter className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>알림 종류</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {(Object.keys(notificationTypeInfo) as NotificationType[]).map((type) => (
                  <DropdownMenuItem 
                    key={type}
                    onClick={() => setActiveType(type)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {notificationTypeInfo[type].icon}
                      <span>{notificationTypeInfo[type].label}</span>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {getCountByType(type)}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* 모두 읽음 처리 버튼 */}
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(notification => !notification.is_read)}
        >
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
              {getUnreadCountByType("all") > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getUnreadCountByType("all")}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 현재 선택된 타입 표시 */}
        {activeType !== "all" && (
          <div className="mt-2 flex items-center">
            <Badge className="px-2 py-1 flex items-center gap-1 bg-primary/10 text-primary border-none">
              {notificationTypeInfo[activeType].icon}
              <span>{notificationTypeInfo[activeType].label} 알림만 표시 중</span>
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveType("all")}
              className="ml-2 h-7 text-xs"
            >
              전체 보기
            </Button>
          </div>
        )}

        {/* 알림 목록 */}
        <TabsContent value="all" className="mt-6">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {activeType === "all" 
                  ? "알림이 없습니다." 
                  : `${notificationTypeInfo[activeType].label} 알림이 없습니다.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.notification_id}
                  className={`overflow-hidden transition-colors ${
                    !notification.is_read ? "border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => !notification.is_read && handleReadNotification(notification.notification_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {renderNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at || '').toLocaleString()}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteAlertId(notification.notification_id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm">{notification.content}</p>
                        {notification.prayer_room?.title && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.prayer_room.title}
                            </Badge>
                            {notification.prayer_request?.title && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {notification.prayer_request.title}
                              </span>
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
          {filteredNotifications.filter(n => !n.is_read).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {activeType === "all"
                  ? "읽지 않은 알림이 없습니다."
                  : `읽지 않은 ${notificationTypeInfo[activeType].label} 알림이 없습니다.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications
                .filter(notification => !notification.is_read)
                .map((notification) => (
                <Card
                  key={notification.notification_id}
                  className="overflow-hidden border-l-4 border-l-primary"
                  onClick={() => handleReadNotification(notification.notification_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {renderNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at || '').toLocaleString()}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteAlertId(notification.notification_id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm">{notification.content}</p>
                        {notification.prayer_room?.title && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.prayer_room.title}
                            </Badge>
                            {notification.prayer_request?.title && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {notification.prayer_request.title}
                              </span>
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

      {/* 알림 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteAlertId} onOpenChange={() => setDeleteAlertId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>알림 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 알림을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteAlertId && handleDeleteNotification(deleteAlertId)}
              className="bg-destructive text-destructive-foreground"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 