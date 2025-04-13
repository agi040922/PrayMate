"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Filter, Clock, Calendar, CalendarDays } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

import PrayerSelection, { PrayerRequest } from "./PrayerSelection"
import ReportPreview from "./ReportPreview"
import FilterDialog from "./FilterDialog"
import { getAllRoomMembersPrayerRequests } from "@/lib/supabase/prayer-room-members"

// 샘플 기도제목 데이터 - 개발 및 폴백용
const samplePrayerRequests: PrayerRequest[] = [
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
  // 다른 샘플 데이터는 축약합니다
]

// 현재 임시 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
const TEMP_USER_ID = "temp-user-123"

export default function ReportContainer() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedPrayers, setSelectedPrayers] = useState<PrayerRequest[]>([])
  const [reportType, setReportType] = useState<"all" | "weekly" | "monthly" | "yearly">("all")
  const [prayerRoom, setPrayerRoom] = useState<string>("all")
  const [category, setCategory] = useState<string>("all")
  const [reportText, setReportText] = useState<string>("")
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // 사용자 정보 가져오기 (실제로는 인증 시스템에서 가져와야 함)
  useEffect(() => {
    // 실제 구현에서는 쿠키나 로컬 스토리지에서 사용자 정보를 가져와야 함
    // 현재는 테스트를 위해 임시 사용자 ID 사용
    setUserId(TEMP_USER_ID)
  }, [])

  // 기도제목 데이터 로드
  const loadPrayerRequests = useCallback(async () => {
    setIsLoading(true)
    try {
      // 사용자 ID가 있는 경우 실제 데이터 로드
      if (userId) {
        const options = {
          period: reportType,
          category: category !== 'all' ? category : undefined,
          is_answered: undefined // 응답/미응답 모두 가져오기
        };

        try {
          const data = await getAllRoomMembersPrayerRequests(userId, options);
          
          if (data && data.length > 0) {
            setSelectedPrayers(data.map(prayer => ({ ...prayer, selected: false })));
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.error("API 오류:", apiError);
          // API 오류 시 샘플 데이터로 폴백
        }
      }

      // 사용자 ID가 없거나 API 오류가 발생한 경우 샘플 데이터 사용
      // 필터 로직 시뮬레이션
      const filteredData = samplePrayerRequests.filter(prayer => {
        const categoryMatch = category === 'all' || prayer.category === category;
        let dateMatch = true;
        
        if (reportType !== 'all') {
          const prayerDate = new Date(prayer.date).getTime();
          const now = Date.now();
          if (reportType === 'weekly') {
            dateMatch = prayerDate > now - 7 * 24 * 60 * 60 * 1000;
          } else if (reportType === 'monthly') {
            dateMatch = prayerDate > now - 30 * 24 * 60 * 60 * 1000;
          } else if (reportType === 'yearly') {
            dateMatch = prayerDate > now - 365 * 24 * 60 * 60 * 1000;
          }
        }
        
        return categoryMatch && dateMatch;
      });
      
      setSelectedPrayers(filteredData.map(prayer => ({ ...prayer, selected: false })));
      setIsLoading(false);
      
      // 샘플 데이터 사용 시 알림
      if (userId) {
        toast({
          title: "개발 모드",
          description: "샘플 기도제목이 표시됩니다.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("기도제목을 불러오는 중 오류가 발생했습니다.", error);
      toast({
        title: "오류 발생",
        description: "기도제목을 불러오지 못했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [reportType, category, prayerRoom, userId, toast]);

  // 기도제목 데이터 로드 (페이지 로드 및 필터 변경 시)
  useEffect(() => {
    loadPrayerRequests();
  }, [loadPrayerRequests]);

  // 필터링된 기도제목 목록
  const getFilteredPrayers = () => {
    return selectedPrayers;
  }

  // 리포트 생성 함수
  const generateReport = () => {
    const selectedItems = selectedPrayers.filter((prayer) => prayer.selected)

    let report = "# 기도제목 리포트\n\n"
    
    // 리포트 기간 추가
    const reportDate = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let periodText = '';
    if (reportType === 'weekly') periodText = '주간';
    else if (reportType === 'monthly') periodText = '월간';
    else if (reportType === 'yearly') periodText = '연간';
    else periodText = '전체';
    
    report += `📅 ${periodText} 리포트 (${reportDate} 작성)\n\n`;

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
        report += `  작성자: ${item.author} (${item.date})\n\n`
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
          report += `  *${item.bibleVerse}*\n`
        }
        report += `  작성자: ${item.author} (${item.date})\n\n`
      })
    }

    // 통계 추가
    report += "## 기도제목 통계\n\n";
    report += `- 총 기도제목: ${selectedItems.length}개\n`;
    report += `- 기도 중인 제목: ${prayingItems.length}개\n`;
    report += `- 응답된 기도제목: ${answeredItems.length}개\n`;
    
    setReportText(report)
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
        {isLoading ? (
          // 로딩 중 스켈레톤 UI
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <PrayerSelection
            prayers={selectedPrayers}
            onPrayerSelectionChange={setSelectedPrayers}
            onGenerateReport={generateReport}
            filteredPrayers={getFilteredPrayers}
          />
        )}

        {/* 리포트 미리보기 및 다운로드 */}
        <ReportPreview reportText={reportText} onReportTextChange={setReportText} />
      </div>

      {/* 필터 다이얼로그 */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        prayerRoom={prayerRoom}
        onPrayerRoomChange={setPrayerRoom}
        category={category}
        onCategoryChange={setCategory}
      />
    </div>
  )
} 