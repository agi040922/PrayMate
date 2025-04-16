"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  BookOpen,
  CheckCircle,
  MessageCircle,
  HeartHandshake 
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useProfile } from "@/lib/context/ProfileContext"
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deletePrayerRequest } from "@/lib/supabase/prayer-requests"
import { PrayerEditDialog } from "../dialogs/prayer-edit-dialog"
import { AnswerDialog } from "../dialogs/answer-dialog"
import { 
  AlertDialog, 
  AlertDialogAction,
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogCancel 
} from "@/components/ui/alert-dialog"

interface PrayerRequestCardProps {
  prayer: any
}

export function PrayerRequestCard({ prayer }: PrayerRequestCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAnswerDialog, setShowAnswerDialog] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { refreshPrayerRequests } = useProfile()
  const { toast } = useToast()
  
  // 기도제목 삭제 처리
  const handleDelete = async () => {
    try {
      await deletePrayerRequest(prayer.request_id)
      toast({
        title: "기도제목 삭제 완료",
        description: "기도제목이 성공적으로 삭제되었습니다."
      })
      refreshPrayerRequests()
    } catch (error) {
      console.error("기도제목 삭제 실패:", error)
      toast({
        title: "삭제 실패",
        description: "기도제목을 삭제하는데 실패했습니다.",
        variant: "destructive"
      })
    }
  }
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) return "날짜 정보 없음"
    
    // 현재와의 상대적 시간 (예: '3일 전')
    const relativeTime = formatDistanceToNow(date, { 
      addSuffix: true,
      locale: ko
    })
    
    // 절대 날짜 (예: 2023년 4월 15일)
    const absoluteDate = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    return `${absoluteDate} (${relativeTime})`
  }
  
  return (
    <>
      <Card className="p-4 mb-4 border shadow-sm hover:shadow transition-shadow duration-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {prayer.categories && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {prayer.categories.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(prayer.created_at)}
              </span>
              {prayer.is_anonymous && (
                <Badge variant="secondary" className="text-xs">익명</Badge>
              )}
              {prayer.is_answered && (
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/10">응답됨</Badge>
              )}
            </div>
            <h3 className="font-semibold text-base">{prayer.title}</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? "접기" : "자세히"}
          </Button>
        </div>
        
        {/* 기도제목 내용 */}
        <p className="text-sm mt-2 text-muted-foreground">{prayer.content}</p>
        
        {/* 성경구절 */}
        {prayer.bible_verse && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-muted/30 rounded-md">
            <BookOpen className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium">{prayer.bible_verse.reference}</p>
              <p className="text-sm italic mt-1">{prayer.bible_verse.text}</p>
            </div>
          </div>
        )}
        
        {/* 응답됨 표시 */}
        {prayer.is_answered && (
          <div className="flex items-center mt-3 gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">응답됨</span>
            <span className="text-xs text-muted-foreground ml-2">
              {formatDate(prayer.updated_at)}
            </span>
          </div>
        )}
        
        {expanded && (
          <div className="mt-4 pt-3 border-t">
            {/* 기도 응답 내용 */}
            {prayer.is_answered && prayer.answers && prayer.answers.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <HeartHandshake className="h-4 w-4 mr-1" /> 
                  응답 내용
                </h4>
                {prayer.answers.map((answer: any) => (
                  <div key={answer.answer_id} className="bg-primary/5 p-3 rounded-md">
                    <p className="text-sm">{answer.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(answer.answered_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : prayer.is_answered ? (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <HeartHandshake className="h-4 w-4 mr-1" /> 
                  응답 내용
                </h4>
                <p className="text-sm text-muted-foreground">
                  등록된 응답 내용이 없습니다.
                </p>
              </div>
            ) : null}
            
            {/* 댓글 */}
            {prayer.comments && prayer.comments.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" /> 
                  댓글 ({prayer.comments.length})
                </h4>
                <div className="space-y-2">
                  {prayer.comments.map((comment: any) => (
                    <div key={comment.comment_id} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {comment.user?.name ? comment.user.name.charAt(0) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline">
                          <p className="text-xs font-medium">
                            {comment.user?.name || '익명'}
                          </p>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" /> 
                  댓글
                </h4>
                <p className="text-sm text-muted-foreground">
                  아직 댓글이 없습니다.
                </p>
              </div>
            )}
            
            {/* 반응 */}
            {prayer.reactions && prayer.reactions.length > 0 && (
              <div className="mt-3 pt-3">
                <div className="flex flex-wrap gap-2">
                  {prayer.reactions.reduce((acc: any, reaction: any) => {
                    if (!acc[reaction.reaction_type]) {
                      acc[reaction.reaction_type] = 0
                    }
                    acc[reaction.reaction_type]++
                    return acc
                  }, {}) &&
                    Object.entries(
                      prayer.reactions.reduce((acc: any, reaction: any) => {
                        if (!acc[reaction.reaction_type]) {
                          acc[reaction.reaction_type] = 0
                        }
                        acc[reaction.reaction_type]++
                        return acc
                      }, {})
                    ).map(([type, count]: [string, any]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type === 'praying' ? '🙏 기도' : 
                         type === 'support' ? '💪 응원' : 
                         type === 'answered' ? '✅ 응답' : type}
                        <span className="ml-1 font-normal">{count}</span>
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            
            {/* 기도제목 관리 버튼 */}
            <div className="flex justify-end gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setShowEditDialog(true)}
              >
                수정
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                삭제
              </Button>
              {!prayer.is_answered && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs text-green-600"
                  onClick={() => setShowAnswerDialog(true)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />응답 표시
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
      
      {/* 기도제목 수정 다이얼로그 */}
      {showEditDialog && (
        <PrayerEditDialog 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog} 
          prayer={prayer}
          onUpdate={refreshPrayerRequests}
        />
      )}
      
      {/* 응답 추가 다이얼로그 */}
      {showAnswerDialog && (
        <AnswerDialog 
          open={showAnswerDialog} 
          onOpenChange={setShowAnswerDialog} 
          prayer={prayer}
          onUpdate={refreshPrayerRequests}
        />
      )}
      
      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기도제목 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 기도제목을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 