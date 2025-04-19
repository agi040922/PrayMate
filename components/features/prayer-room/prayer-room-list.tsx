"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Globe, Users, Settings } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { getUserPrayerRooms } from "@/lib/supabase/prayer-rooms"
import { useAuth } from "@/lib/context/AuthContext"
import { useRouter } from "next/navigation"

// 기도방 타입 정의
interface PrayerRoom {
  room_id: string
  title: string
  description?: string
  is_public: boolean
  participant_id?: string
  role?: string
  created_at?: string
  joined_at?: string
  memberCount?: number
  prayerCount?: number
}

interface PrayerRoomListProps {
  onManageRoom?: (roomId: string) => void
  onViewMembers?: (roomId: string) => void
  onSelectRoom?: (roomId: string) => void
  closeSidebar?: () => void
}

export function PrayerRoomList({ onManageRoom, onViewMembers, onSelectRoom, closeSidebar }: PrayerRoomListProps) {
  const [rooms, setRooms] = useState<PrayerRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchPrayerRooms = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        const data = await getUserPrayerRooms(user.id)
        setRooms(data)
      } catch (error) {
        console.error("기도방 목록 로딩 실패:", error)
        toast({
          title: "기도방 목록 불러오기 실패",
          description: "기도방 목록을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrayerRooms()
  }, [user, toast])

  // 기도방 카드 클릭 핸들러
  const handleRoomClick = (roomId: string) => {
    // 모바일 환경인지 확인 (화면 너비로 판단)
    const isMobile = window.innerWidth < 768;
    
    // 기도방 선택 시 
    if (onSelectRoom) {
      onSelectRoom(roomId);
    } else {
      // onSelectRoom이 없는 경우 직접 이동
      router.push(`/prayer-room?id=${roomId}`);
    }
    
    // 모바일 환경에서 사이드바 닫기
    if (isMobile && closeSidebar) {
      closeSidebar();
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">기도방 목록을 불러오는 중...</div>
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">참여 중인 기도방이 없습니다.</p>
        <Button asChild>
          <Link href="/prayer-room">기도방 찾아보기</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <Card 
          key={room.room_id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleRoomClick(room.room_id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* 기도방 공개/비공개 아이콘 */}
                {!room.is_public ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle className="text-lg">{room.title}</CardTitle>
              </div>
              {/* 관리자 배지 */}
              {room.role === "admin" && <Badge variant="outline">관리자</Badge>}
            </div>
            <CardDescription>{room.description}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                {/* 참여 시간 표시 */}
                <span className="text-xs text-muted-foreground">
                  {room.joined_at ? `참여: ${new Date(room.joined_at).toLocaleDateString()}` : ''}
                </span>
              </div>
              <div>
                {/* 생성 시간 표시 */}
                <span className="text-xs text-muted-foreground">
                  {room.created_at ? `생성: ${new Date(room.created_at).toLocaleDateString()}` : ''}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            {/* 관리자인 경우 관리 버튼 표시, 아니면 구성원 보기 버튼 표시 */}
            {room.role === "admin" ? (
              onManageRoom && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation(); // 버블링 방지
                    onManageRoom(room.room_id);
                  }}
                >
                  관리
                </Button>
              )
            ) : (
              onViewMembers && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation(); // 버블링 방지
                    onViewMembers(room.room_id);
                  }}
                >
                  정보
                </Button>
              )
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}