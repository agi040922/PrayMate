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
  HeartHandshake,
  Plus,
  ChevronUp,
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  showActions?: boolean  // 관리 버튼 표시 여부 (수정, 삭제, 응답추가 등)
}

export function PrayerRequestCard({ prayer, showActions = true }: PrayerRequestCardProps) {
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
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? "접기" : "자세히"}
            </Button>
            
            {/* 드롭다운 메뉴 추가 */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    수정하기
                  </DropdownMenuItem>
                  
                  {/* 응답되지 않은 기도제목에만 응답 표시 버튼 보이기 */}
                  {!prayer.is_answered && (
                    <DropdownMenuItem onClick={() => setShowAnswerDialog(true)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      응답 표시
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => setConfirmDelete(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제하기
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
                          {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : '?'}
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
                      acc[reaction.reaction_type] = {
                        count: 0,
                        users: []
                      }
                    }
                    acc[reaction.reaction_type].count++
                    
                    // 반응한 사용자 정보 추가
                    if (reaction.user && reaction.user.name) {
                      acc[reaction.reaction_type].users.push(reaction.user.name)
                    }
                    
                    return acc
                  }, {}) &&
                    Object.entries(
                      prayer.reactions.reduce((acc: any, reaction: any) => {
                        if (!acc[reaction.reaction_type]) {
                          acc[reaction.reaction_type] = {
                            count: 0,
                            users: []
                          }
                        }
                        acc[reaction.reaction_type].count++
                        
                        // 반응한 사용자 정보 추가
                        if (reaction.user && reaction.user.name) {
                          acc[reaction.reaction_type].users.push(reaction.user.name)
                        }
                        
                        return acc
                      }, {})
                    ).map(([type, data]: [string, any]) => (
                      <div key={type} className="flex items-center">
                        <Badge variant="secondary" className="text-xs">
                          {type === 'praying' ? '🙏 기도' : 
                           type === 'support' ? '💪 응원' : 
                           type === 'answered' ? '✅ 응답' : type}
                          <span className="ml-1 font-normal">{data.count}</span>
                        </Badge>
                        
                        {data.users.length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" align="start">
                              <div className="text-xs font-medium mb-1">
                                {type === 'praying' ? '함께 기도하는 사람들' : 
                                 type === 'support' ? '응원하는 사람들' : 
                                 type === 'answered' ? '응답됨에 기뻐하는 사람들' : `${type} 반응한 사람들`}
                              </div>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {Array.from(new Set(data.users) as Set<string>).map((name, idx) => (
                                  <div key={idx} className="text-xs py-0.5 px-1 hover:bg-muted rounded-sm">
                                    {name}
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
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