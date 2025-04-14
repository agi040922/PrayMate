"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Filter, Clock, Calendar, CalendarDays } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

import PrayerSelection from "./PrayerSelection"
import ReportPreview from "./ReportPreview"
import FilterDialog from "./FilterDialog"
import { useAuth } from "@/lib/context/AuthContext"
import { 
  PrayerRequest, 
  ReportFilterOptions, 
  getFilteredPrayerRequests,
  getPersonalPrayerNotesForReport
} from "@/lib/supabase/reports"

export default function ReportContainer() {
  // 인증 관련
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  // 상태 변수
  const [selectedPrayers, setSelectedPrayers] = useState<PrayerRequest[]>([])
  const [reportText, setReportText] = useState<string>("")
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // 필터 옵션
  const [roomId, setRoomId] = useState<string>('all')
  const [memberId, setMemberId] = useState<string>('all')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [period, setPeriod] = useState<"all" | "weekly" | "monthly" | "yearly">("all")
  const [category, setCategory] = useState<string>("all")
  const [includePersonalPrayers, setIncludePersonalPrayers] = useState(false)
  const [personalPrayerType, setPersonalPrayerType] = useState<"weekly" | "monthly" | "yearly">("weekly")
  
  // 필터 변경 시 기도제목 로드
  useEffect(() => {
    const loadPrayerRequests = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // 필터 옵션 구성
        const options: ReportFilterOptions = {
          roomId,
          memberId: memberIds.length > 0 ? 'selected' : memberId,
          memberIds: memberIds.length > 0 ? memberIds : undefined,
          period,
          category
        }
        
        // 기도제목 로드
        const data = await getFilteredPrayerRequests(user.id, options)
        
        // 개인 기도제목 포함 여부
        if (includePersonalPrayers) {
          try {
            // 개인 기도제목 로드
            const personalNotes = await getPersonalPrayerNotesForReport(user.id, { 
              period,
              periodType: personalPrayerType
            })
            
            // 개인 기도제목을 PrayerRequest 형태로 변환
            const personalPrayers: PrayerRequest[] = personalNotes.map(note => ({
              id: note.note_id,
              title: `[개인 ${note.period_type === 'weekly' ? '주간' : note.period_type === 'monthly' ? '월간' : '연간'}] ${note.content.substring(0, 30)}${note.content.length > 30 ? '...' : ''}`,
              content: note.content,
              author: '나',
              authorId: user.id,
              category: '개인',
              date: new Date(note.created_at || '').toISOString().split('T')[0],
              status: note.is_completed ? 'answered' : 'praying',
              selected: false,
              isPersonalNote: true, // 구분을 위한 추가 필드
              periodType: note.period_type,
              periodLabel: note.period_label
            }))
            
            // 기존 기도제목과 개인 기도제목 합치기
            setSelectedPrayers([...data, ...personalPrayers])
          } catch (error) {
            console.error('개인 기도제목 로드 실패:', error)
            setSelectedPrayers(data)
          }
        } else {
          setSelectedPrayers(data)
        }
      } catch (error) {
        console.error("기도제목 로드 실패:", error)
        toast({
          title: "기도제목 로딩 실패",
          description: "기도제목을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
        setSelectedPrayers([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPrayerRequests()
  }, [user, roomId, memberId, memberIds, period, category, includePersonalPrayers, personalPrayerType, toast])

  // 필터링된 기도제목 목록
  const getFilteredPrayers = () => {
    return selectedPrayers
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
    })
    
    let periodText = ''
    if (period === 'weekly') periodText = '주간'
    else if (period === 'monthly') periodText = '월간'
    else if (period === 'yearly') periodText = '연간'
    else periodText = '전체'
    
    report += `📅 ${periodText} 리포트 (${reportDate} 작성)\n\n`

    // 필터 정보 추가
    report += `📌 필터: ${category === 'all' ? '모든 카테고리' : category}\n`
    if (includePersonalPrayers) {
      report += `📔 개인 ${personalPrayerType === 'weekly' ? '주간' : personalPrayerType === 'monthly' ? '월간' : '연간'} 기도제목 포함\n`
    }
    report += '\n'

    // 개인 기도제목과 공유 기도제목 분리
    const personalItems = selectedItems.filter(item => item.isPersonalNote)
    const sharedItems = selectedItems.filter(item => !item.isPersonalNote)

    // 공유 기도제목
    if (sharedItems.length > 0) {
      report += "## 공유 기도제목\n\n"
      
      // 기도 중인 기도제목
      const prayingItems = sharedItems.filter((item) => item.status === "praying" || item.status === null)
      if (prayingItems.length > 0) {
        report += "### 기도 중인 제목\n\n"
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
      const answeredItems = sharedItems.filter((item) => item.status === "answered")
      if (answeredItems.length > 0) {
        report += "### 응답된 기도제목\n\n"
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
    }

    // 개인 기도제목
    if (personalItems.length > 0) {
      report += "## 개인 기간별 기도제목\n\n"
      
      // 주간/월간/연간 기도제목 분류
      const weeklyItems = personalItems.filter(item => item.periodType === 'weekly')
      const monthlyItems = personalItems.filter(item => item.periodType === 'monthly')
      const yearlyItems = personalItems.filter(item => item.periodType === 'yearly')
      
      // 주간 기도제목
      if (weeklyItems.length > 0) {
        report += "### 주간 기도제목\n\n"
        weeklyItems.forEach((item) => {
          report += `- ${item.content}\n`
          report += `  기간: ${item.periodLabel}\n`
          report += `  상태: ${item.status === 'answered' ? '✅ 응답됨' : '🙏 기도중'}\n\n`
        })
      }
      
      // 월간 기도제목
      if (monthlyItems.length > 0) {
        report += "### 월간 기도제목\n\n"
        monthlyItems.forEach((item) => {
          report += `- ${item.content}\n`
          report += `  기간: ${item.periodLabel}\n`
          report += `  상태: ${item.status === 'answered' ? '✅ 응답됨' : '🙏 기도중'}\n\n`
        })
      }
      
      // 연간 기도제목
      if (yearlyItems.length > 0) {
        report += "### 연간 기도제목\n\n"
        yearlyItems.forEach((item) => {
          report += `- ${item.content}\n`
          report += `  기간: ${item.periodLabel}\n`
          report += `  상태: ${item.status === 'answered' ? '✅ 응답됨' : '🙏 기도중'}\n\n`
        })
      }
    }

    // 통계 추가
    report += "## 기도제목 통계\n\n"
    report += `- 총 기도제목: ${selectedItems.length}개\n`
    if (sharedItems.length > 0) {
      const prayingShared = sharedItems.filter(item => item.status === "praying" || item.status === null).length
      const answeredShared = sharedItems.filter(item => item.status === "answered").length
      report += `- 공유 기도제목: ${sharedItems.length}개 (기도중: ${prayingShared}개, 응답됨: ${answeredShared}개)\n`
    }
    if (personalItems.length > 0) {
      const prayingPersonal = personalItems.filter(item => item.status === "praying" || item.status === null).length
      const answeredPersonal = personalItems.filter(item => item.status === "answered").length
      report += `- 개인 기도제목: ${personalItems.length}개 (기도중: ${prayingPersonal}개, 응답됨: ${answeredPersonal}개)\n`
    }
    
    setReportText(report)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* 리포트 페이지 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prayer-room">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">기도제목 리포트</h1>
        </div>

        {/* 필터 버튼 */}
        <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      {/* 리포트 타입 선택 탭 */}
      <Tabs defaultValue={period} onValueChange={(value) => setPeriod(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="weekly">
            <Clock className="mr-2 h-4 w-4" />
            주간
          </TabsTrigger>
          <TabsTrigger value="monthly">
            <Calendar className="mr-2 h-4 w-4" />
            월간
          </TabsTrigger>
          <TabsTrigger value="yearly">
            <CalendarDays className="mr-2 h-4 w-4" />
            연간
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 기도제목 선택 및 리포트 영역 */}
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
        roomId={roomId}
        onRoomChange={setRoomId}
        memberId={memberId}
        onMemberChange={setMemberId}
        memberIds={memberIds}
        onMemberIdsChange={setMemberIds}
        category={category}
        onCategoryChange={setCategory}
        period={period}
        onPeriodChange={setPeriod}
        includePersonalPrayers={includePersonalPrayers}
        onIncludePersonalPrayersChange={setIncludePersonalPrayers}
        personalPrayerType={personalPrayerType}
        onPersonalPrayerTypeChange={setPersonalPrayerType}
      />
    </div>
  )
} 