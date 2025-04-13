"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// 기도제목 타입 정의
export interface PrayerRequest {
  id: string
  title: string
  content: string
  bibleVerse?: string
  author: string
  category: string
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
              <div>
                <Label htmlFor={`prayer-${prayer.id}`} className="font-medium">
                  {prayer.title}
                </Label>
                <p className="text-sm text-muted-foreground line-clamp-1">{prayer.content}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {prayer.category === "personal"
                      ? "개인"
                      : prayer.category === "community"
                        ? "공동체"
                        : prayer.category === "thanksgiving"
                          ? "감사"
                          : "중보기도"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{prayer.date}</span>
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