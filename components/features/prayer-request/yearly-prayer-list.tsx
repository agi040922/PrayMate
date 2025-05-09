"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Check, PlusCircle, Eye, EyeOff } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import {
  PersonalPrayerNote,
  getPersonalPrayerNotes,
  createPersonalPrayerNote,
  updatePersonalPrayerNote,
  deletePersonalPrayerNote,
  togglePersonalPrayerNoteCompletion,
  getCurrentPeriodLabel
} from "@/lib/supabase/personal-prayer-notes"
import { Switch } from "@/components/ui/switch"

interface YearlyPrayerListProps {
  type: "weekly" | "monthly" | "yearly"
  prayers?: PersonalPrayerNote[]
  onUpdate?: () => void
  externalOpenTrigger?: boolean
  onExternalOpenChange?: (open: boolean) => void
}

export function YearlyPrayerList({
  type,
  prayers: externalPrayers,
  onUpdate,
  externalOpenTrigger = false,
  onExternalOpenChange
}: YearlyPrayerListProps) {
  const [prayers, setPrayers] = useState<PersonalPrayerNote[]>([])
  const [editingPrayer, setEditingPrayer] = useState<PersonalPrayerNote | null>(null)
  const [newContent, setNewContent] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPrayerContent, setNewPrayerContent] = useState("")
  const [newPrayerIsPublic, setNewPrayerIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(!externalPrayers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null)
  const [showCompleteAlert, setShowCompleteAlert] = useState<string | null>(null)
  const [editPrayerContent, setEditPrayerContent] = useState("")
  const [editPrayerIsPublic, setEditPrayerIsPublic] = useState(true)

  const { toast } = useToast()
  const { user } = useAuth()

  // 기간별 라벨 포맷팅
  const formatPeriodLabel = (periodLabel: string) => {
    if (type === "weekly" && periodLabel.includes("W")) {
      const [year, week] = periodLabel.split("-W")
      return `${year}년 ${parseInt(week)}주차`
    } else if (type === "monthly" && periodLabel.includes("-")) {
      const [year, month] = periodLabel.split("-")
      return `${year}년 ${parseInt(month)}월`
    } else {
      return `${periodLabel}년`
    }
  }

  // 외부 prayers가 제공되면 그것을 사용
  useEffect(() => {
    if (externalPrayers) {
      setPrayers(externalPrayers);
      setIsLoading(false);
    }
  }, [externalPrayers]);

  // 외부 prayers가 없을 때만 직접 불러오기
  useEffect(() => {
    const fetchPrayers = async () => {
      if (!user || externalPrayers) {
        setIsLoading(false)
        return
      }

      try {
        const data = await getPersonalPrayerNotes(user.id, type)
        setPrayers(data || [])
      } catch (error) {
        console.error("기간별 기도제목 로딩 실패:", error)
        toast({
          title: "기도제목 로딩 실패",
          description: "기도제목을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrayers()
  }, [user, type, toast, externalPrayers])

  // 외부 트리거를 통한 다이얼로그 열기
  useEffect(() => {
    if (externalOpenTrigger) {
      setShowCreateDialog(true);
      // 상태 초기화
      onExternalOpenChange && onExternalOpenChange(false);
    }
  }, [externalOpenTrigger, onExternalOpenChange]);

  // 기도제목 완료 상태 토글 함수
  const toggleComplete = async (id: string) => {
    if (!user) return

    try {
      await togglePersonalPrayerNoteCompletion(id)
      
      // 화면 상태 업데이트
      setPrayers(prayers.map((prayer) => 
        prayer.note_id === id 
          ? { ...prayer, is_completed: !prayer.is_completed } 
          : prayer
      ))
      
      // 부모 컴포넌트 업데이트 콜백
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("기도제목 상태 변경 실패:", error)
      toast({
        title: "상태 변경 실패",
        description: "기도제목 상태를 변경하는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 기도제목 편집 시작 함수
  const startEditing = (prayer: PersonalPrayerNote) => {
    setEditingPrayer(prayer)
    setNewContent(prayer.content)
    setIsPublic(prayer.is_public !== false)
    setShowEditDialog(true)
  }

  // 기도제목 편집 저장 함수
  const saveEdit = async () => {
    if (!editingPrayer || !newContent.trim() || !user) return

    setIsSubmitting(true)

    try {
      const updatedPrayer = await updatePersonalPrayerNote(editingPrayer.note_id, {
        content: newContent,
        is_public: isPublic
      })

      // 화면 업데이트
      setPrayers(prayers.map((prayer) => 
        prayer.note_id === editingPrayer.note_id 
          ? { ...prayer, content: newContent, is_public: isPublic } 
          : prayer
      ))

      toast({
        title: "기도제목 수정 완료",
        description: "기도제목이 성공적으로 수정되었습니다."
      })

      setShowEditDialog(false)
      setEditingPrayer(null)
      setNewContent("")
      
      // 부모 컴포넌트 업데이트 콜백
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("기도제목 수정 실패:", error)
      toast({
        title: "수정 실패",
        description: "기도제목을 수정하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 새 기도제목 추가 함수
  const createNewPrayer = async () => {
    if (!newPrayerContent.trim() || !user) return

    setIsSubmitting(true)

    try {
      const newPrayer = await createPersonalPrayerNote({
        user_id: user.id,
        period_type: type,
        content: newPrayerContent,
        is_public: newPrayerIsPublic
      })

      // 목록에 추가
      setPrayers([newPrayer, ...prayers])

      toast({
        title: "기도제목 추가 완료",
        description: "새 기도제목이 추가되었습니다."
      })

      setShowCreateDialog(false)
      setNewPrayerContent("")
      setNewPrayerIsPublic(true)
      
      // 부모 컴포넌트 업데이트 콜백
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("기도제목 추가 실패:", error)
      toast({
        title: "추가 실패",
        description: "기도제목을 추가하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 기도제목 삭제 함수
  const deletePrayer = async (id: string) => {
    if (!user) return

    try {
      await deletePersonalPrayerNote(id)
      
      // 화면 업데이트
      setPrayers(prayers.filter(prayer => prayer.note_id !== id))
      
      toast({
        title: "기도제목 삭제 완료",
        description: "기도제목이 삭제되었습니다."
      })
      
      // 부모 컴포넌트 업데이트 콜백
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("기도제목 삭제 실패:", error)
      toast({
        title: "삭제 실패",
        description: "기도제목을 삭제하는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 제목 텍스트 구하기
  const getTypeTitle = () => {
    switch (type) {
      case "weekly":
        return "주간"
      case "monthly":
        return "월간"
      case "yearly":
        return "연간"
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-6 w-3/4 bg-muted rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-muted rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-muted rounded"></div>
      </div>
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{getTypeTitle()} 기도제목</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowCreateDialog(true)}
          className="gap-1 min-h-[36px]"
        >
          <PlusCircle className="h-4 w-4" /> 추가
        </Button>
      </div>

      {prayers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {getTypeTitle()} 기도제목이 없습니다.
          </p>
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setShowCreateDialog(true)}
            className="min-h-[36px]"
          >
            새 기도제목 추가하기
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {prayers.map((prayer) => (
            <div
              key={prayer.note_id}
              className={`flex items-start justify-between rounded-md border p-3 ${
                prayer.is_completed ? "bg-muted/50" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                {/* 완료 체크 버튼 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => toggleComplete(prayer.note_id)}
                >
                  <div
                    className={`h-5 w-5 rounded-full border ${
                      prayer.is_completed ? "bg-primary border-primary" : "border-muted-foreground"
                    }`}
                  >
                    {prayer.is_completed && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </Button>
                <div>
                  <p className={`text-sm ${prayer.is_completed ? "line-through text-muted-foreground" : ""}`}>
                    {prayer.content}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{formatPeriodLabel(prayer.period_label)}</span>
                    {prayer.is_public === false ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* 편집 버튼 */}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing(prayer)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                {/* 삭제 버튼 */}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePrayer(prayer.note_id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 기도제목 편집 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {getTypeTitle()} 기도제목 편집
            </DialogTitle>
            {editingPrayer && (
              <DialogDescription>
                {formatPeriodLabel(editingPrayer.period_label)}
              </DialogDescription>
            )}
          </DialogHeader>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="기도제목을 입력하세요"
            className="min-h-[120px]"
          />
          <div className="flex items-center gap-2 pt-2">
            <Switch 
              id="edit-is-public" 
              checked={isPublic} 
              onCheckedChange={setIsPublic} 
            />
            <Label htmlFor="edit-is-public" className="flex items-center gap-1">
              {isPublic ? (
                <>공개 <Eye className="h-4 w-4" /></>
              ) : (
                <>비공개 <EyeOff className="h-4 w-4" /></>
              )}
            </Label>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-2 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px]"
            >
              취소
            </Button>
            <Button 
              onClick={saveEdit}
              disabled={isSubmitting || !newContent.trim()}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 새 기도제목 추가 다이얼로그 */}
      <Dialog 
        open={showCreateDialog} 
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open && onExternalOpenChange) {
            onExternalOpenChange(false);
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              새 {getTypeTitle()} 기도제목 추가
            </DialogTitle>
            <DialogDescription>
              {getTypeTitle()} 기도제목을 작성해주세요.
              {type === "weekly" && " 이번 주에 기도할 내용을 적어보세요."}
              {type === "monthly" && " 이번 달 중점적으로 기도할 내용을 적어보세요."}
              {type === "yearly" && " 올해 이루고 싶은 기도제목을 적어보세요."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="new-prayer">기도제목</Label>
            <Textarea
              id="new-prayer"
              value={newPrayerContent}
              onChange={(e) => setNewPrayerContent(e.target.value)}
              placeholder="기도제목을 입력하세요"
              className="min-h-[120px]"
            />
            <div className="flex items-center gap-2">
              <Switch 
                id="new-is-public" 
                checked={newPrayerIsPublic} 
                onCheckedChange={setNewPrayerIsPublic} 
              />
              <Label htmlFor="new-is-public" className="flex items-center gap-1">
                {newPrayerIsPublic ? (
                  <>공개 <Eye className="h-4 w-4" /></>
                ) : (
                  <>비공개 <EyeOff className="h-4 w-4" /></>
                )}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              현재 기간: {formatPeriodLabel(getCurrentPeriodLabel(type))}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-2 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px]"
            >
              취소
            </Button>
            <Button 
              onClick={createNewPrayer}
              disabled={isSubmitting || !newPrayerContent.trim()}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {isSubmitting ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
