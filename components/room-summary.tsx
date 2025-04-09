import type React from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface RoomSummaryProps extends React.HTMLAttributes<HTMLDivElement> {}

interface RoomData {
  id: string
  name: string
  totalPrayers: number
  responseRate: number
  newToday: number
  isAdmin: boolean
}

const roomData: RoomData[] = [
  {
    id: "1",
    name: "가족을 위한 기도",
    totalPrayers: 24,
    responseRate: 45,
    newToday: 2,
    isAdmin: true,
  },
  {
    id: "2",
    name: "교회 공동체",
    totalPrayers: 56,
    responseRate: 32,
    newToday: 5,
    isAdmin: false,
  },
  {
    id: "3",
    name: "선교사 중보기도",
    totalPrayers: 38,
    responseRate: 28,
    newToday: 0,
    isAdmin: true,
  },
]

export function RoomSummary({ className, ...props }: RoomSummaryProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold">내 기도방 요약</h2>
      </div>
      <div className="flex-1 space-y-4 p-4">
        {roomData.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{room.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">총 기도제목</span>
                  <span className="font-medium">{room.totalPrayers}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">응답률</span>
                  <span className="font-medium">{room.responseRate}%</span>
                </div>
                <Progress value={room.responseRate} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">오늘 새 기도제목</span>
                  <span className="font-medium">{room.newToday}개</span>
                </div>
              </div>
            </CardContent>
            {room.isAdmin && (
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />방 관리
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
