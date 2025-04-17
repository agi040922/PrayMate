"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, CheckCircle2, Clock } from "lucide-react"

// 기도제목 타입 정의
export interface PrayerRequest {
  id: string
  title: string
  content: string
  bibleVerse?: string
  author: string
  authorId?: string
  category: string | number
  date: string
  status: "praying" | "answered" | null
  response?: string
  selected?: boolean
}

interface PrayerSelectionProps {
  prayers: PrayerRequest[]
  onPrayerSelectionChange: (prayers: PrayerRequest[]) => void
  onGenerateReport: () => void
  filteredPrayers: () => PrayerRequest[]
}

export default function PrayerSelection({
  prayers,
  onPrayerSelectionChange,
  onGenerateReport,
  filteredPrayers,
}: PrayerSelectionProps) {
  // 기도제목 선택 토글 함수
  const togglePrayerSelection = (id: string) => {
    onPrayerSelectionChange(
      prayers.map((prayer) => (prayer.id === id ? { ...prayer, selected: !prayer.selected } : prayer))
    )
  }

  // 모든 기도제목 선택/해제 함수
  const toggleSelectAll = (select: boolean) => {
    onPrayerSelectionChange(prayers.map((prayer) => ({ ...prayer, selected: select })))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>기도제목 선택</CardTitle>
        <CardDescription>리포트에 포함할 기도제목을 선택하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={prayers.every((prayer) => prayer.selected)}
              onCheckedChange={(checked) => toggleSelectAll(!!checked)}
            />
            <Label htmlFor="select-all">전체 선택</Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {prayers.filter((prayer) => prayer.selected).length}/{prayers.length} 선택됨
          </span>
        </div>

        <div className="max-h-[400px] space-y-2 overflow-y-auto">
          {filteredPrayers().map((prayer) => (
            <div key={prayer.id} className="flex items-start space-x-2 rounded-md border p-3 hover:bg-muted/50">
              <Checkbox
                id={`prayer-${prayer.id}`}
                checked={prayer.selected}
                onCheckedChange={() => togglePrayerSelection(prayer.id)}
              />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`prayer-${prayer.id}`} className="font-medium">
                    {prayer.title}
                  </Label>
                  {prayer.status === "answered" ? (
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>응답됨</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>기도중</span>
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{prayer.content}</p>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {prayer.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{prayer.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{prayer.author || "작성자 없음"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {/* 리포트 생성 버튼 */}
        <Button onClick={onGenerateReport} className="w-full">
          리포트 생성
        </Button>
      </CardFooter>
    </Card>
  )
} 