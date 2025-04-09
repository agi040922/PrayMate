"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Copy, Calendar, CalendarDays, Clock, Filter } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 기도제목 타입 정의
interface PrayerRequest {
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

// 샘플 기도제목 데이터
const prayerRequests: PrayerRequest[] = [
  {
    id: "1",
    title: "아버지의 건강 회복을 위해 기도해주세요",
    content: "아버지께서 최근 건강이 좋지 않으셔서 병원에 다니고 계십니다. 빠른 회복을 위해 기도 부탁드립니다.",
    bibleVerse: "시편 30:2 여호와 내 하나님이여 내가 주께 부르짖으매 나를 고치셨나이다",
    author: "김성실",
    category: "personal",
    date: "2023-04-08",
    status: "praying",
  },
  {
    id: "2",
    title: "취업을 위한 기도 부탁드립니다",
    content: "다음 주에 중요한 면접이 있습니다. 하나님의 인도하심을 구합니다.",
    author: "이믿음",
    category: "personal",
    date: "2023-04-07",
    status: null,
  },
  {
    id: "3",
    title: "선교사님들의 안전과 사역을 위해",
    content: "해외에서 사역 중인 선교사님들의 안전과 사역의 열매를 위해 기도해주세요.",
    bibleVerse: "마태복음 28:19-20 그러므로 너희는 가서 모든 민족을 제자로 삼아...",
    author: "박소망",
    category: "intercession",
    date: "2023-04-05",
    status: "answered",
    response:
      "선교사님들이 안전하게 현지에 도착하셨고, 현지인들과의 첫 만남도 은혜롭게 진행되었습니다. 계속해서 사역의 열매를 위해 기도해주세요.",
  },
  {
    id: "4",
    title: "교회 청년부 수련회를 위한 기도",
    content: "다음 달에 있을 청년부 수련회가 은혜 가운데 진행될 수 있도록 기도 부탁드립니다.",
    author: "정은혜",
    category: "community",
    date: "2023-04-04",
    status: "praying",
  },
  {
    id: "5",
    title: "새 직장에 감사드립니다",
    content: "오랜 기도 끝에 새 직장을 허락해주신 하나님께 감사드립니다. 앞으로의 사역도 인도해주시길 기도합니다.",
    bibleVerse: "시편 107:1 여호와께 감사하라 그는 선하시며 그의 인자하심이 영원함이로다",
    author: "최감사",
    category: "thanksgiving",
    date: "2023-04-03",
    status: "answered",
    response: "기도해주신 모든 분들께 감사드립니다. 좋은 회사에 취직하게 되었고 다음 주부터 출근합니다!",
  },
]

export default function ReportsPage() {
  const [selectedPrayers, setSelectedPrayers] = useState<PrayerRequest[]>(
    prayerRequests.map((prayer) => ({ ...prayer, selected: false })),
  )
  const [reportType, setReportType] = useState<"all" | "weekly" | "monthly" | "yearly">("all")
  const [prayerRoom, setPrayerRoom] = useState<string>("all")
  const [category, setCategory] = useState<string>("all")
  const [reportText, setReportText] = useState<string>("")
  const [showFilterDialog, setShowFilterDialog] = useState(false)

  // 기도제목 선택 토글 함수
  const togglePrayerSelection = (id: string) => {
    setSelectedPrayers(
      selectedPrayers.map((prayer) => (prayer.id === id ? { ...prayer, selected: !prayer.selected } : prayer)),
    )
  }

  // 모든 기도제목 선택/해제 함수
  const toggleSelectAll = (select: boolean) => {
    setSelectedPrayers(selectedPrayers.map((prayer) => ({ ...prayer, selected: select })))
  }

  // 필터링된 기도제목 목록
  const getFilteredPrayers = () => {
    return selectedPrayers.filter((prayer) => {
      const roomMatch = prayerRoom === "all" || true // 실제로는 기도방 필터링 로직 추가
      const categoryMatch = category === "all" || prayer.category === category
      const statusMatch =
        reportType === "all" ||
        (reportType === "weekly" && new Date(prayer.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (reportType === "monthly" && new Date(prayer.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
        (reportType === "yearly" && new Date(prayer.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))

      return roomMatch && categoryMatch && statusMatch
    })
  }

  // 리포트 생성 함수
  const generateReport = () => {
    const selectedItems = selectedPrayers.filter((prayer) => prayer.selected)

    let report = "# 기도제목 리포트\n\n"

    // 기도 중인 기도제목
    const prayingItems = selectedItems.filter((item) => item.status === "praying" || item.status === null)
    if (prayingItems.length > 0) {
      report += "## 기도 중인 제목\n\n"
      prayingItems.forEach((item) => {
        report += `- ${item.title}\n`
        report += `  ${item.content}\n`
        if (item.bibleVerse) {
          report += `  *${item.bibleVerse}*\n`
        }
        report += "\n"
      })
    }

    // 응답된 기도제목
    const answeredItems = selectedItems.filter((item) => item.status === "answered")
    if (answeredItems.length > 0) {
      report += "## 응답된 기도제목\n\n"
      answeredItems.forEach((item) => {
        report += `- ${item.title}\n`
        report += `  ${item.content}\n`
        if (item.response) {
          report += `  **응답:** ${item.response}\n`
        }
        if (item.bibleVerse) {
          report += `  **응답:** ${item.response}\n`
        }
        if (item.bibleVerse) {
          report += `  *${item.bibleVerse}*\n`
        }
        report += "\n"
      })
    }

    setReportText(report)
  }

  // 리포트 복사 함수
  const copyReport = () => {
    navigator.clipboard.writeText(reportText)
  }

  // 리포트 다운로드 함수
  const downloadReport = () => {
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `기도제목_리포트_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* 리포트 페이지 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 뒤로가기 버튼 */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prayer-room">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">리포트 다운로드</h1>
        </div>

        {/* 필터 버튼 */}
        <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      {/* 리포트 타입 선택 탭 */}
      <Tabs defaultValue={reportType} onValueChange={(value) => setReportType(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          {/* 전체 기도제목 탭 */}
          <TabsTrigger value="all">전체</TabsTrigger>
          {/* 주간 기도제목 탭 */}
          <TabsTrigger value="weekly">
            <Clock className="mr-2 h-4 w-4" />
            주간
          </TabsTrigger>
          {/* 월간 기도제목 탭 */}
          <TabsTrigger value="monthly">
            <Calendar className="mr-2 h-4 w-4" />
            월간
          </TabsTrigger>
          {/* 연간 기도제목 탭 */}
          <TabsTrigger value="yearly">
            <CalendarDays className="mr-2 h-4 w-4" />
            연간
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 기도제목 선택 영역 */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
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
                  checked={selectedPrayers.every((prayer) => prayer.selected)}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                />
                <Label htmlFor="select-all">전체 선택</Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedPrayers.filter((prayer) => prayer.selected).length}/{selectedPrayers.length} 선택됨
              </span>
            </div>

            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {getFilteredPrayers().map((prayer) => (
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
            <Button onClick={generateReport} className="w-full">
              리포트 생성
            </Button>
          </CardFooter>
        </Card>

        {/* 리포트 미리보기 및 다운로드 */}
        <Card>
          <CardHeader>
            <CardTitle>리포트 미리보기</CardTitle>
            <CardDescription>생성된 리포트를 확인하고 다운로드하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="기도제목을 선택하고 '리포트 생성' 버튼을 클릭하세요."
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            {/* 리포트 복사 버튼 */}
            <Button variant="outline" onClick={copyReport} disabled={!reportText}>
              <Copy className="mr-2 h-4 w-4" />
              복사
            </Button>
            {/* 리포트 다운로드 버튼 */}
            <Button onClick={downloadReport} disabled={!reportText}>
              <Download className="mr-2 h-4 w-4" />
              다운로드
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 필터 다이얼로그 */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>리포트 필터 설정</DialogTitle>
            <DialogDescription>리포트에 포함할 기도제목을 필터링하세요</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prayer-room">기도방</Label>
              <Select value={prayerRoom} onValueChange={setPrayerRoom}>
                <SelectTrigger id="prayer-room">
                  <SelectValue placeholder="기도방 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 기도방</SelectItem>
                  <SelectItem value="family">가족을 위한 기도</SelectItem>
                  <SelectItem value="church">교회 공동체</SelectItem>
                  <SelectItem value="mission">선교사 중보기도</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 카테고리</SelectItem>
                  <SelectItem value="personal">개인</SelectItem>
                  <SelectItem value="community">공동체</SelectItem>
                  <SelectItem value="thanksgiving">감사</SelectItem>
                  <SelectItem value="intercession">중보기도</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              취소
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>적용</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 필요한 컴포넌트 import
import { Badge } from "@/components/ui/badge"
