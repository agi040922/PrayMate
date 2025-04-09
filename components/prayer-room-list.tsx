"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Globe, Users, Settings } from "lucide-react"
import Link from "next/link"

// 기도방 타입 정의
interface PrayerRoom {
  id: string
  name: string
  description: string
  isPrivate: boolean
  memberCount: number
  prayerCount: number
  isAdmin: boolean
  lastActive: string
}

// 샘플 기도방 데이터
const prayerRooms: PrayerRoom[] = [
  {
    id: "1",
    name: "가족을 위한 기도",
    description: "우리 가족을 위한 기도제목을 나누는 공간입니다.",
    isPrivate: true,
    memberCount: 5,
    prayerCount: 24,
    isAdmin: true,
    lastActive: "2023-04-10",
  },
  {
    id: "2",
    name: "교회 공동체",
    description: "교회 공동체를 위한 기도제목을 나누는 공간입니다.",
    isPrivate: false,
    memberCount: 32,
    prayerCount: 56,
    isAdmin: false,
    lastActive: "2023-04-09",
  },
  {
    id: "3",
    name: "선교사 중보기도",
    description: "선교사님들을 위한 중보기도 공간입니다.",
    isPrivate: false,
    memberCount: 18,
    prayerCount: 38,
    isAdmin: true,
    lastActive: "2023-04-08",
  },
  {
    id: "4",
    name: "개인 기도제목",
    description: "개인적인 기도제목을 기록하는 공간입니다.",
    isPrivate: true,
    memberCount: 1,
    prayerCount: 15,
    isAdmin: true,
    lastActive: "2023-04-07",
  },
  {
    id: "5",
    name: "나라와 민족을 위한 기도",
    description: "나라와 민족을 위한 기도제목을 나누는 공간입니다.",
    isPrivate: false,
    memberCount: 45,
    prayerCount: 28,
    isAdmin: false,
    lastActive: "2023-04-06",
  },
]

interface PrayerRoomListProps {
  onManageRoom?: (roomId: string) => void
}

export function PrayerRoomList({ onManageRoom }: PrayerRoomListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prayerRooms.map((room) => (
        <Card key={room.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* 기도방 공개/비공개 아이콘 */}
                {room.isPrivate ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle className="text-lg">{room.name}</CardTitle>
              </div>
              {/* 관리자 배지 */}
              {room.isAdmin && <Badge variant="outline">관리자</Badge>}
            </div>
            <CardDescription>{room.description}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                {/* 참여자 수 */}
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{room.memberCount}명 참여</span>
              </div>
              <div>
                {/* 기도제목 수 */}
                <span className="text-muted-foreground">기도제목 {room.prayerCount}개</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {/* 마지막 활동 시간 */}
              마지막 활동: {room.lastActive}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            {/* 기도방 입장 버튼 */}
            <Button variant="outline" size="sm" asChild>
              <Link href="/prayer-room">입장하기</Link>
            </Button>
            {/* 기도방 관리 버튼 (관리자인 경우만 표시) */}
            {room.isAdmin && onManageRoom && (
              <Button variant="ghost" size="sm" onClick={() => onManageRoom(room.id)}>
                <Settings className="mr-2 h-4 w-4" />
                관리
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
