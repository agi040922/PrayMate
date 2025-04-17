"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Lock, Users, MessageSquare, CalendarDays } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import { 
  getPrayerRoomDetails, 
  getRoomParticipants,
  checkRoomParticipation,
  joinPrayerRoom 
} from "@/lib/supabase/prayer-rooms"

interface RoomSummaryProps {
  roomId: string
}

export function RoomSummary({ roomId }: RoomSummaryProps) {
  const [room, setRoom] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [isParticipant, setIsParticipant] = useState<boolean>(false)
  const [isJoining, setIsJoining] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return
      
      try {
        setLoading(true)
        // 기도방 정보 가져오기
        const roomData = await getPrayerRoomDetails(roomId)
        setRoom(roomData)
        
        // 참여자 목록 가져오기
        const participantsData = await getRoomParticipants(roomId)
        setParticipants(participantsData)
        
        // 현재 사용자가 참여자인지 확인
        if (user) {
          const participationData = await checkRoomParticipation(roomId, user.id)
          setIsParticipant(!!participationData)
        }
      } catch (error) {
        console.error("기도방 정보 로딩 실패:", error)
        toast({
          title: "기도방 정보 로딩 실패",
          description: "기도방 정보를 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchRoomData()
  }, [roomId, user, toast])
  
  // 기도방 참여 처리
  const handleJoinRoom = async () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "기도방에 참여하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsJoining(true)
      await joinPrayerRoom({
        room_id: roomId,
        user_id: user.id,
        role: "member"
      })
      
      setIsParticipant(true)
      
      toast({
        title: "참여 완료",
        description: "기도방에 성공적으로 참여했습니다.",
      })
    } catch (error) {
      console.error("기도방 참여 실패:", error)
      toast({
        title: "참여 실패",
        description: "기도방 참여 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <p>기도방 정보를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!room) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <p>기도방 정보를 찾을 수 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!room.is_public ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle>{room.title}</CardTitle>
          </div>
          <Badge variant={room.is_public ? "secondary" : "outline"}>
            {room.is_public ? "공개" : "비공개"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 기도방 설명 */}
          <p className="text-muted-foreground">{room.description}</p>
          
          {/* 기도방 정보 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{participants.length}명 참여 중</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>생성일: {new Date(room.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* 참여 버튼 */}
          {!isParticipant && (
            <Button
              className="w-full"
              onClick={handleJoinRoom}
              disabled={isJoining}
            >
              {isJoining ? "참여 중..." : "기도방 참여하기"}
            </Button>
          )}
          
          {/* {isParticipant && (
            <Badge className="w-full justify-center py-2" variant="outline">
              이미 참여 중인 기도방입니다
            </Badge>
          )} */}
        </div>
      </CardContent>
    </Card>
  )
}