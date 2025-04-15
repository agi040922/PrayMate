"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PrayerRequestList } from "@/components/features/prayer-request/prayer-request-list"
import { YearlyPrayerList } from "@/components/features/prayer-request/yearly-prayer-list"
import { PrayerRoomList } from "@/components/features/prayer-room/prayer-room-list"
import { 
  Pencil, 
  LogOut, 
  Bell, 
  Clock, 
  Calendar, 
  CalendarDays,
  PlusCircle, 
  CheckCircle, 
  BookOpen, 
  MessageCircle, 
  HeartHandshake 
} from "lucide-react"
import Link from "next/link"
import { ManagePrayerRoomDialog } from "@/components/features/prayer-room/manage-prayer-room-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProfileProvider, useProfile } from "@/lib/context/ProfileContext"
import { useAuth } from "@/lib/context/AuthContext"
import { signOut, updateUserProfile, getUserProfile } from "@/lib/supabase/users"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { 
  updatePrayerRequest, 
  updateAnsweredStatus, 
  createPrayerAnswer, 
  deletePrayerRequest,
  getPrayerAnswers,
  deletePrayerAnswer
} from "@/lib/supabase/prayer-requests"

// 프로필 편집 다이얼로그 컴포넌트
function ProfileEditDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  // 사용자 프로필 정보 로드
  useEffect(() => {
    if (open) {
      const loadProfile = async () => {
        try {
          const profile = await getUserProfile()
          if (profile) {
            setName(profile.name || "")
            setContact(profile.contact || "")
          }
        } catch (error) {
          console.error("프로필 정보 로드 실패:", error)
        }
      }
      
      loadProfile()
    }
  }, [open])
  
  // 프로필 저장 함수
  const handleSave = async () => {
    setIsSubmitting(true)
    
    try {
      await updateUserProfile({
        name,
        contact
      })
      
      toast({
        title: "프로필 업데이트 완료",
        description: "프로필 정보가 성공적으로 업데이트되었습니다."
      })
      
      onOpenChange(false)
      // 페이지 새로고침하여 변경사항 반영
      window.location.reload()
    } catch (error) {
      console.error("프로필 업데이트 실패:", error)
      toast({
        title: "업데이트 실패",
        description: "프로필 정보를 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 편집</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">이름</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="이름을 입력하세요"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="contact">연락처</Label>
            <Input 
              id="contact" 
              value={contact} 
              onChange={(e) => setContact(e.target.value)} 
              placeholder="연락처를 입력하세요"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 응답된 기도제목 컴포넌트
function AnsweredPrayerCard({ prayer }: { prayer: any }) {
  const [expanded, setExpanded] = useState(false)
  
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
      <div className="flex items-center mt-3 gap-1 text-primary">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">응답됨</span>
        <span className="text-xs text-muted-foreground ml-2">
          {formatDate(prayer.updated_at)}
        </span>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-3 border-t">
          {/* 기도 응답 내용 */}
          {prayer.answers && prayer.answers.length > 0 ? (
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
          ) : (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <HeartHandshake className="h-4 w-4 mr-1" /> 
                응답 내용
              </h4>
              <p className="text-sm text-muted-foreground">
                등록된 응답 내용이 없습니다.
              </p>
            </div>
          )}
          
          {/* 구분선 */}
          <Separator className="my-3" />
          
          {/* 댓글 */}
          {prayer.comments && prayer.comments.length > 0 ? (
            <div>
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
            <div>
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
        </div>
      )}
    </Card>
  )
}

// 기도제목 편집 다이얼로그
function PrayerEditDialog({ 
  open, 
  onOpenChange, 
  prayer, 
  onUpdate 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  prayer: any,
  onUpdate: () => void
}) {
  const [title, setTitle] = useState(prayer?.title || "")
  const [content, setContent] = useState(prayer?.content || "")
  const [isAnonymous, setIsAnonymous] = useState(prayer?.is_anonymous || false)
  const [bibleReference, setBibleReference] = useState(prayer?.bible_verse?.reference || "")
  const [bibleText, setBibleText] = useState(prayer?.bible_verse?.text || "")
  const [categoryId, setCategoryId] = useState<number | undefined>(prayer?.category_id)
  const [isAnswered, setIsAnswered] = useState(prayer?.is_answered || false)
  const [answerContent, setAnswerContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { categories } = useProfile()
  const { toast } = useToast()
  
  // 응답 내용 불러오기
  useEffect(() => {
    const loadAnswers = async () => {
      if (prayer?.is_answered && prayer?.request_id) {
        try {
          const answers = await getPrayerAnswers(prayer.request_id)
          if (answers && answers.length > 0) {
            setAnswerContent(answers[0].content || "")
          }
        } catch (error) {
          console.error("응답 내용 불러오기 실패:", error)
        }
      }
    }
    
    if (open) {
      loadAnswers()
    }
  }, [open, prayer])
  
  // 기도제목 저장 함수
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive"
      })
      return
    }
    
    // 응답 표시하는데 응답 내용이 없는 경우
    if (isAnswered && !answerContent.trim()) {
      toast({
        title: "입력 오류",
        description: "응답 내용을 입력해주세요.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 1. 기도제목 정보 업데이트
      await updatePrayerRequest(prayer.request_id, {
        title,
        content,
        is_anonymous: isAnonymous,
        category_id: categoryId === 0 ? undefined : categoryId,
        bible_verse: (bibleReference && bibleText) ? {
          reference: bibleReference,
          text: bibleText
        } : undefined
      })
      
      // 2. 응답 상태 변경
      if (isAnswered !== prayer.is_answered) {
        await updateAnsweredStatus(prayer.request_id, isAnswered)
      }
      
      // 3. 응답된 경우 응답 내용 저장
      if (isAnswered && answerContent.trim()) {
        // 기존 응답이 있는지 확인
        const answers = await getPrayerAnswers(prayer.request_id)
        
        if (answers && answers.length > 0) {
          // 기존 응답을 삭제하고 새로 만드는 방식으로 구현
          try {
            // 1. 기존 응답을 삭제
            await deletePrayerAnswer(answers[0].answer_id)
            
            // 2. 새 응답 추가
            await createPrayerAnswer({
              request_id: prayer.request_id,
              content: answerContent
            })
          } catch (error) {
            console.error("응답 업데이트 실패:", error)
            throw error
          }
        } else {
          // 새 응답 추가
          await createPrayerAnswer({
            request_id: prayer.request_id,
            content: answerContent
          })
        }
      }
      
      toast({
        title: "기도제목 수정 완료",
        description: "기도제목이 성공적으로 수정되었습니다."
      })
      
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error("기도제목 수정 실패:", error)
      toast({
        title: "수정 실패",
        description: "기도제목을 수정하는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  //기도제목 수정
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>기도제목 수정</DialogTitle>
          <DialogDescription>
            기도제목의 내용을 수정하고 변경사항을 저장하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* 카테고리 선택 */}
          <div className="grid gap-2">
            <Label htmlFor="category">카테고리</Label>
            <Select 
              value={categoryId?.toString() || "none"} 
              onValueChange={(value) => setCategoryId(value === "none" ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">카테고리 없음</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.category_id} value={category.category_id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 제목 입력 */}
          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="기도제목 제목을 입력하세요"
            />
          </div>
          
          {/* 내용 입력 */}
          <div className="grid gap-2">
            <Label htmlFor="content">내용</Label>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="기도제목 내용을 입력하세요"
              className="h-24"
            />
          </div>
          
          {/* 성경구절 입력 */}
          <div className="grid gap-2">
            <Label htmlFor="bible">성경구절</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                id="bible-reference" 
                value={bibleReference} 
                onChange={(e) => setBibleReference(e.target.value)} 
                placeholder="예: 요한복음 3:16"
              />
              <Input 
                id="bible-text" 
                value={bibleText} 
                onChange={(e) => setBibleText(e.target.value)} 
                placeholder="구절 내용"
              />
            </div>
            <p className="text-xs text-muted-foreground">성경구절 참조와 내용을 함께 입력하세요.</p>
          </div>
          
          {/* 응답 여부 */}
          <div className="flex items-center gap-2">
            <Checkbox 
              id="answered" 
              checked={isAnswered} 
              onCheckedChange={(checked) => setIsAnswered(checked === true)}
            />
            <Label htmlFor="answered" className="cursor-pointer">기도 응답 표시</Label>
          </div>
          
          {/* 응답 내용 입력 (응답 체크한 경우에만 표시) */}
          {isAnswered && (
            <div className="grid gap-2">
              <Label htmlFor="answer">응답 내용</Label>
              <Textarea 
                id="answer" 
                value={answerContent} 
                onChange={(e) => setAnswerContent(e.target.value)} 
                placeholder="하나님의 응답을 기록하세요"
                className="h-24"
              />
            </div>
          )}
          
          {/* 익명 여부 */}
          <div className="flex items-center gap-2">
            <Checkbox 
              id="anonymous" 
              checked={isAnonymous} 
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <Label htmlFor="anonymous" className="cursor-pointer">익명으로 게시</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 응답 추가 다이얼로그
function AnswerDialog({ 
  open, 
  onOpenChange, 
  prayer, 
  onUpdate 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  prayer: any,
  onUpdate: () => void
}) {
  const [answerContent, setAnswerContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const handleSave = async () => {
    if (!answerContent.trim()) {
      toast({
        title: "입력 오류",
        description: "응답 내용을 입력해주세요.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 1. 기도제목을 응답됨으로 표시
      await updateAnsweredStatus(prayer.request_id, true)
      
      // 2. 응답 내용 저장
      await createPrayerAnswer({
        request_id: prayer.request_id,
        content: answerContent
      })
      
      toast({
        title: "응답 추가 완료",
        description: "기도 응답이 성공적으로 추가되었습니다."
      })
      
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error("응답 추가 실패:", error)
      toast({
        title: "응답 추가 실패",
        description: "응답을 추가하는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>응답 추가하기</DialogTitle>
          <DialogDescription>
            하나님께서 응답하신 내용을 기록하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="answer">응답 내용</Label>
            <Textarea 
              id="answer" 
              value={answerContent} 
              onChange={(e) => setAnswerContent(e.target.value)} 
              placeholder="하나님의 응답을 기록하세요"
              className="h-32"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "응답 추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 내 기도제목 컴포넌트
function PrayerRequestCard({ prayer }: { prayer: any }) {
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

// 실제 프로필 페이지 컴포넌트
function ProfileContent() {
  const [activeTab, setActiveTab] = useState("my-prayers")
  const [showManageDialog, setShowManageDialog] = useState(false)
  const [showProfileEditDialog, setShowProfileEditDialog] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prayerFilter, setPrayerFilter] = useState<"all" | "answered" | "unanswered">("all")
  const { toast } = useToast()
  
  const { 
    userPrayerRequests,
    answeredPrayerRequests,
    loadingPrayerRequests,
    userRooms, 
    selectedRoomId, 
    setSelectedRoomId, 
    weeklyPrayers, 
    monthlyPrayers, 
    yearlyPrayers,
    refreshPeriodPrayers,
    refreshPrayerRequests
  } = useProfile()
  
  const { user } = useAuth()
  
  // 사용자 프로필 정보 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        const profile = await getUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error("사용자 프로필 로드 실패:", error)
        toast({
          title: "프로필 로드 실패",
          description: "사용자 프로필을 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserProfile()
  }, [user, toast])

  const handleManageRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowManageDialog(true)
  }
  
  const handleViewMembers = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowManageDialog(true)
  }
  
  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "로그아웃 성공",
        description: "성공적으로 로그아웃되었습니다."
      })
      
      // 로그인 페이지로 리디렉션
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("로그아웃 실패:", error)
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }
  
  // 사용자 프로필 이미지의 이니셜 생성
  const getInitials = () => {
    if (!userProfile || !userProfile.name) return "익명"
    
    return userProfile.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
  }

  // 필터링된 기도제목 가져오기
  const getFilteredPrayers = () => {
    if (prayerFilter === "answered") {
      return answeredPrayerRequests;
    } else if (prayerFilter === "unanswered") {
      return userPrayerRequests;
    } else {
      return [...userPrayerRequests, ...answeredPrayerRequests];
    }
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <p>프로필 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* 프로필 헤더 섹션 */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={userProfile?.avatar_url || "/placeholder-user.jpg"} alt="프로필 이미지" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{userProfile?.name || "이름 미설정"}</h1>
            <p className="text-muted-foreground">{userProfile?.email || user?.email || "이메일 미설정"}</p>
            <div className="mt-2 flex gap-2">
              {/* 프로필 편집 버튼 */}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => setShowProfileEditDialog(true)}
              >
                <Pencil className="mr-2 h-3 w-3" />
                프로필 편집
              </Button>
              {/* 로그아웃 버튼 */}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-3 w-3" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* 알림 버튼 - 알림 페이지로 이동 */}
          <Button variant="outline" asChild>
            <Link href="/notifications">
              <Bell className="mr-2 h-4 w-4" />
              알림
            </Link>
          </Button>
        </div>
      </div>

      {/* 프로필 콘텐츠 탭 */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          {/* 내 기도제목 탭 */}
          <TabsTrigger value="my-prayers">내 기도제목</TabsTrigger>
          {/* 기간별 기도제목 탭 */}
          <TabsTrigger value="time-prayers">기간별 기도제목</TabsTrigger>
          {/* 내 기도방 탭 */}
          <TabsTrigger value="my-rooms">내 기도방</TabsTrigger>
        </TabsList>

        {/* 내 기도제목 탭 콘텐츠 */}
        <TabsContent value="my-prayers" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">내가 작성한 기도제목</h2>
            <div className="flex items-center gap-2">
              <Select 
                defaultValue={prayerFilter} 
                onValueChange={(value: "all" | "answered" | "unanswered") => setPrayerFilter(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="전체 기도제목" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 기도제목</SelectItem>
                  <SelectItem value="answered">응답된 기도</SelectItem>
                  <SelectItem value="unanswered">응답 대기중</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                defaultValue={selectedRoomId || "all"} 
                onValueChange={(value) => setSelectedRoomId(value === "all" ? null : value)}
              >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="모든 기도방" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 기도방</SelectItem>
                  {userRooms.map(room => (
                    <SelectItem key={room.room_id} value={room.room_id}>
                      {room.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            </div>
          </div>
          {/* 새 기도제목 추가 버튼 */}
          <Button variant="outline" className="w-full mb-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            새 기도제목 작성하기
          </Button>
          {/* 내가 작성한 기도제목 목록 */}
          {loadingPrayerRequests ? (
            <div className="text-center p-4">기도제목을 불러오는 중...</div>
          ) : getFilteredPrayers().length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              {prayerFilter === "answered" ? "응답된 기도제목이 없습니다." :
               prayerFilter === "unanswered" ? "응답 대기중인 기도제목이 없습니다." :
               "작성된 기도제목이 없습니다."}
            </div>
          ) : (
            <div className="space-y-1">
              {getFilteredPrayers().map((request) => (
                <PrayerRequestCard key={request.request_id} prayer={request} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* 기간별 기도제목 탭 콘텐츠 */}
        <TabsContent value="time-prayers" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* 주간 기도제목 카드 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">주간 기도제목</CardTitle>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>이번 주 집중할 기도제목</CardDescription>
              </CardHeader>
              <CardContent>
                <YearlyPrayerList type="weekly" prayers={weeklyPrayers} onUpdate={refreshPeriodPrayers} />
                {/* 주간 기도제목 추가 버튼 */}
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => {
                    // 기도제목 작성 다이얼로그 표시 로직 필요
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  주간 기도제목 작성
                </Button>
              </CardContent>
            </Card>

            {/* 월간 기도제목 카드 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">월간 기도제목</CardTitle>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>이번 달 집중할 기도제목</CardDescription>
              </CardHeader>
              <CardContent>
                <YearlyPrayerList type="monthly" prayers={monthlyPrayers} onUpdate={refreshPeriodPrayers} />
                {/* 월간 기도제목 추가 버튼 */}
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => {
                    // 기도제목 작성 다이얼로그 표시 로직 필요
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  월간 기도제목 작성
                </Button>
              </CardContent>
            </Card>

            {/* 연간 기도제목 카드 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">연간 기도제목</CardTitle>
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>올해 집중할 기도제목</CardDescription>
              </CardHeader>
              <CardContent>
                <YearlyPrayerList type="yearly" prayers={yearlyPrayers} onUpdate={refreshPeriodPrayers} />
                {/* 연간 기도제목 추가 버튼 */}
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => {
                    // 기도제목 작성 다이얼로그 표시 로직 필요
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  연간 기도제목 작성
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 내 기도방 탭 콘텐츠 */}
        <TabsContent value="my-rooms" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">내가 참여 중인 기도방</h2>
            {/* 새 기도방 생성 버튼 */}
            <Button>
              <Pencil className="mr-2 h-4 w-4" />새 기도방 생성
            </Button>
          </div>
          {/* 내가 참여 중인 기도방 목록 */}
          <PrayerRoomList 
            onManageRoom={handleManageRoom} 
            onViewMembers={handleViewMembers} 
          />
        </TabsContent>
      </Tabs>

      {/* 기도방 관리 다이얼로그 */}
      {selectedRoomId && (
        <ManagePrayerRoomDialog 
          open={showManageDialog} 
          onOpenChange={setShowManageDialog} 
          roomId={selectedRoomId} 
          isAdmin={userRooms.find(room => room.room_id === selectedRoomId)?.role === "admin"}
        />
      )}
      
      {/* 프로필 편집 다이얼로그 */}
      <ProfileEditDialog 
        open={showProfileEditDialog} 
        onOpenChange={setShowProfileEditDialog} 
      />
    </div>
  )
}

// 내보내는 페이지 컴포넌트 - ProfileProvider로 감싸기
export default function ProfilePage() {
  return (
    <ProfileProvider>
      <ProfileContent />
    </ProfileProvider>
  )
}
