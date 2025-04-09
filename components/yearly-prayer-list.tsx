"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Check } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// 기간별 기도제목 타입 정의
interface TimePrayer {
  id: string
  content: string
  date: string
  isCompleted: boolean
}

// 샘플 기간별 기도제목 데이터
const weeklyPrayers: TimePrayer[] = [
  { id: "w1", content: "교회 청년부 모임을 위해", date: "2023-04-10", isCompleted: false },
  { id: "w2", content: "직장에서의 지혜를 구합니다", date: "2023-04-10", isCompleted: false },
  { id: "w3", content: "가족의 건강을 위해", date: "2023-04-10", isCompleted: true },
]

const monthlyPrayers: TimePrayer[] = [
  { id: "m1", content: "성경 1독을 위한 꾸준한 말씀 읽기", date: "2023-04-01", isCompleted: false },
  { id: "m2", content: "전도의 기회를 열어주시도록", date: "2023-04-01", isCompleted: false },
  { id: "m3", content: "재정의 지혜로운 사용", date: "2023-04-01", isCompleted: true },
]

const yearlyPrayers: TimePrayer[] = [
  { id: "y1", content: "영적 성장과 믿음의 성숙", date: "2023-01-01", isCompleted: false },
  { id: "y2", content: "선교지 방문 및 봉사 기회", date: "2023-01-01", isCompleted: false },
  { id: "y3", content: "가정 예배의 회복", date: "2023-01-01", isCompleted: false },
  { id: "y4", content: "교회 공동체 섬김의 자리 찾기", date: "2023-01-01", isCompleted: false },
  { id: "y5", content: "복음을 전할 용기와 지혜", date: "2023-01-01", isCompleted: true },
]

interface YearlyPrayerListProps {
  type: "weekly" | "monthly" | "yearly"
}

export function YearlyPrayerList({ type }: YearlyPrayerListProps) {
  // 기간별 기도제목 데이터 선택
  const getPrayersByType = () => {
    switch (type) {
      case "weekly":
        return weeklyPrayers
      case "monthly":
        return monthlyPrayers
      case "yearly":
        return yearlyPrayers
    }
  }

  const [prayers, setPrayers] = useState<TimePrayer[]>(getPrayersByType())
  const [editingPrayer, setEditingPrayer] = useState<TimePrayer | null>(null)
  const [newContent, setNewContent] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)

  // 기도제목 완료 상태 토글 함수
  const toggleComplete = (id: string) => {
    setPrayers(prayers.map((prayer) => (prayer.id === id ? { ...prayer, isCompleted: !prayer.isCompleted } : prayer)))
  }

  // 기도제목 편집 시작 함수
  const startEditing = (prayer: TimePrayer) => {
    setEditingPrayer(prayer)
    setNewContent(prayer.content)
    setShowEditDialog(true)
  }

  // 기도제목 편집 저장 함수
  const saveEdit = () => {
    if (!editingPrayer || !newContent.trim()) return

    setPrayers(prayers.map((prayer) => (prayer.id === editingPrayer.id ? { ...prayer, content: newContent } : prayer)))
    setShowEditDialog(false)
    setEditingPrayer(null)
    setNewContent("")
  }

  // 기도제목 삭제 함수
  const deletePrayer = (id: string) => {
    setPrayers(prayers.filter((prayer) => prayer.id !== id))
  }

  return (
    <div className="space-y-2">
      {prayers.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">
          {type === "weekly"
            ? "주간 기도제목이 없습니다."
            : type === "monthly"
              ? "월간 기도제목이 없습니다."
              : "연간 기도제목이 없습니다."}
        </p>
      ) : (
        prayers.map((prayer) => (
          <div
            key={prayer.id}
            className={`flex items-start justify-between rounded-md border p-2 ${
              prayer.isCompleted ? "bg-muted/50" : ""
            }`}
          >
            <div className="flex items-start gap-2">
              {/* 완료 체크 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => toggleComplete(prayer.id)}
              >
                <div
                  className={`h-4 w-4 rounded-full border ${
                    prayer.isCompleted ? "bg-primary border-primary" : "border-muted-foreground"
                  }`}
                >
                  {prayer.isCompleted && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </Button>
              <p className={`text-sm ${prayer.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                {prayer.content}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {/* 편집 버튼 */}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditing(prayer)}>
                <Pencil className="h-3 w-3" />
              </Button>
              {/* 삭제 버튼 */}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deletePrayer(prayer.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))
      )}

      {/* 기도제목 편집 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {type === "weekly"
                ? "주간 기도제목 편집"
                : type === "monthly"
                  ? "월간 기도제목 편집"
                  : "연간 기도제목 편집"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="기도제목을 입력하세요"
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              취소
            </Button>
            <Button onClick={saveEdit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
