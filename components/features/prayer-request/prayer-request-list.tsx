"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageSquare, Heart, CheckCircle, Clock, Pencil, Trash2, MoreVertical, BookOpen, Plus } from "lucide-react"
import { CommentSection } from "@/components/features/comments/comment-section"
import { PrayerResponseDialog } from "@/components/features/prayer-request/prayer-response-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import {
  getPrayerRequests,
  deletePrayerRequest,
  addReaction,
  getUserReactions,
  updateAnsweredStatus,
  getPrayerAnswers,
  getComments,
  getReactions
} from "@/lib/supabase/prayer-requests"
import { getBibleVerseByRequestId } from "@/lib/supabase/bible-verses"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface PrayerRequestListProps {
  roomId?: string
  category?: string
  viewMode: "card" | "list" | "compact"
  showManageButtons?: boolean
  answeredOnly?: boolean
}

export function PrayerRequestList({
  roomId,
  category = "all",
  viewMode = "card",
  showManageButtons = false,
  answeredOnly = false,
}: PrayerRequestListProps) {
  const [prayerRequests, setPrayerRequests] = useState<any[]>([])
  const [userReactions, setUserReactions] = useState<Record<string, Record<string, boolean>>>({})
  const [showComments, setShowComments] = useState<string | null>(null)
  const [showResponse, setShowResponse] = useState<string | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const pageSize = 10
  
  const { toast } = useToast()
  const { user } = useAuth()

  // 기도 요청 목록 불러오기
  useEffect(() => {
    const fetchPrayerRequests = async () => {
      if (!roomId || !user) {
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      
      try {
        // 선택한 카테고리에 해당하는 기도 요청만 필터링
        let categoryId
        if (category !== "all") {
          // 카테고리 ID 매핑 (실제 카테고리 ID로 대체해야 함)
          const categoryMap: Record<string, number> = {
            "personal": 1, // 개인
            "community": 2, // 공동체
            "thanksgiving": 3, // 감사
            "intercession": 4, // 중보기도
          }
          categoryId = categoryMap[category]
        }
        
        const options: any = {
          limit: pageSize,
          offset: 0 // 처음 로드할 때는 0부터 시작
        }
        if (categoryId) options.category_id = categoryId
        if (answeredOnly) options.is_answered = true
        
        // 기본 기도 요청 데이터 불러오기
        const data = await getPrayerRequests(roomId, options)
        
        // 더 불러올 데이터가 있는지 확인
        setHasMore(data.length === pageSize)
        
        // 각 기도 요청에 대한 상세 정보 불러오기
        const detailedRequests = await Promise.all(
          data.map(async (request) => {
            try {
              // 기도 응답 데이터 불러오기
              const answers = await getPrayerAnswers(request.request_id)
              
              // 댓글 데이터 불러오기
              const comments = await getComments(request.request_id)
              
              // 반응 데이터 불러오기
              const reactions = await getReactions(request.request_id)
              
              // 성경 구절 불러오기
              const bibleVerse = await getBibleVerseByRequestId(request.request_id)
              
              // 사용자 반응 상태 가져오기
              const userReaction = await getUserReactions(request.request_id, user.id)
              setUserReactions(prev => ({
                ...prev,
                [request.request_id]: userReaction
              }))
              
              // 댓글 수와 기도 수 계산
              const commentCount = comments?.length || 0
              const prayCount = reactions?.filter(r => r.reaction_type === "praying")?.length || 0
              
              return {
                ...request,
                answers,
                comments,
                reactions,
                commentCount,
                prayCount,
                bible_verse: bibleVerse
              }
            } catch (error) {
              console.error(`기도제목 ${request.request_id} 상세 정보 불러오기 실패:`, error)
              return request
            }
          })
        )
        
        setPrayerRequests(detailedRequests)
        setPage(1) // 페이지 초기화
      } catch (error) {
        console.error("기도 요청 목록 로딩 실패:", error)
        toast({
          title: "기도 요청 목록 로딩 실패",
          description: "기도 요청 목록을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrayerRequests()
  }, [roomId, category, answeredOnly, user, toast])

  // 추가 데이터 로드 함수
  const loadMorePrayerRequests = async () => {
    if (!roomId || !user || isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    
    try {
      // 선택한 카테고리에 해당하는 기도 요청만 필터링
      let categoryId
      if (category !== "all") {
        // 카테고리 ID 매핑 (실제 카테고리 ID로 대체해야 함)
        const categoryMap: Record<string, number> = {
          "personal": 1, // 개인
          "community": 2, // 공동체
          "thanksgiving": 3, // 감사
          "intercession": 4, // 중보기도
        }
        categoryId = categoryMap[category]
      }
      
      const nextPage = page + 1
      const options: any = {
        limit: pageSize,
        offset: (nextPage - 1) * pageSize
      }
      if (categoryId) options.category_id = categoryId
      if (answeredOnly) options.is_answered = true
      
      // 추가 기도 요청 데이터 불러오기
      const data = await getPrayerRequests(roomId, options)
      
      // 더 불러올 데이터가 있는지 확인
      setHasMore(data.length === pageSize)
      
      // 각 기도 요청에 대한 상세 정보 불러오기
      const detailedRequests = await Promise.all(
        data.map(async (request) => {
          try {
            // 기도 응답 데이터 불러오기
            const answers = await getPrayerAnswers(request.request_id)
            
            // 댓글 데이터 불러오기
            const comments = await getComments(request.request_id)
            
            // 반응 데이터 불러오기
            const reactions = await getReactions(request.request_id)
            
            // 성경 구절 불러오기
            const bibleVerse = await getBibleVerseByRequestId(request.request_id)
            
            // 사용자 반응 상태 가져오기
            const userReaction = await getUserReactions(request.request_id, user.id)
            setUserReactions(prev => ({
              ...prev,
              [request.request_id]: userReaction
            }))
            
            // 댓글 수와 기도 수 계산
            const commentCount = comments?.length || 0
            const prayCount = reactions?.filter(r => r.reaction_type === "praying")?.length || 0
            
            return {
              ...request,
              answers,
              comments,
              reactions,
              commentCount,
              prayCount,
              bible_verse: bibleVerse
            }
          } catch (error) {
            console.error(`기도제목 ${request.request_id} 상세 정보 불러오기 실패:`, error)
            return request
          }
        })
      )
      
      // 새 데이터를 기존 데이터에 추가
      setPrayerRequests(prev => [...prev, ...detailedRequests])
      setPage(nextPage)
    } catch (error) {
      console.error("추가 기도 요청 로딩 실패:", error)
      toast({
        title: "추가 데이터 로딩 실패",
        description: "더 많은 기도 요청을 불러오는데 문제가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 기도 버튼 클릭 함수
  const handlePrayClick = async (requestId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "이 기능을 사용하려면 로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }
    
    try {
      await addReaction({
        request_id: requestId,
        user_id: user.id,
        reaction_type: "praying"
      })
      
      // 반응 상태 업데이트
      setUserReactions(prev => ({
        ...prev,
        [requestId]: {
          ...prev[requestId],
          praying: !prev[requestId]?.praying
        }
      }))
      
      // 화면에 표시된 기도 수 업데이트
      setPrayerRequests(prev => 
        prev.map(request => {
          if (request.request_id === requestId) {
            const currentCount = request.prayCount || 0
            const newCount = userReactions[requestId]?.praying ? currentCount - 1 : currentCount + 1
            return { ...request, prayCount: newCount }
          }
          return request
        })
      )
    } catch (error) {
      console.error("기도 반응 추가 실패:", error)
      toast({
        title: "작업 실패",
        description: "기도 반응을 추가하는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 기도 응답 표시 함수
  const handleMarkAsAnswered = async (requestId: string, isAnswered: boolean) => {
    if (!user) return
    
    try {
      await updateAnsweredStatus(requestId, !isAnswered)
      
      // 기도 요청 목록 업데이트
      setPrayerRequests(prev => 
        prev.map(request => {
          if (request.request_id === requestId) {
            return { ...request, is_answered: !isAnswered }
          }
          return request
        })
      )
      
      toast({
        title: isAnswered ? "기도 응답 취소" : "기도 응답 표시",
        description: isAnswered 
          ? "기도 요청이 응답 취소되었습니다." 
          : "기도 요청이 응답 처리되었습니다.",
      })
    } catch (error) {
      console.error("기도 응답 상태 변경 실패:", error)
      toast({
        title: "작업 실패",
        description: "기도 응답 상태를 변경하는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 기도제목 삭제 함수
  const handleDeletePrayer = async (id: string) => {
    try {
      await deletePrayerRequest(id)
      
      // 목록에서 삭제된 기도 요청 제거
      setPrayerRequests(prev => prev.filter(request => request.request_id !== id))
      
      toast({
        title: "기도 요청 삭제 완료",
        description: "기도 요청이 삭제되었습니다.",
      })
      
      setShowDeleteAlert(null)
    } catch (error) {
      console.error("기도 요청 삭제 실패:", error)
      toast({
        title: "삭제 실패",
        description: "기도 요청을 삭제하는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 카테고리 라벨 가져오기 함수
  const getCategoryLabel = (categoryId?: number) => {
    if (!categoryId) return "기타"
    
    const categoryMap: Record<number, string> = {
      1: "개인",
      2: "공동체",
      3: "감사",
      4: "중보기도"
    }
    
    return categoryMap[categoryId] || "기타"
  }

  // 상태 아이콘 가져오기 함수
  const getStatusIcon = (isAnswered: boolean) => {
    return isAnswered
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <Clock className="h-4 w-4 text-sky-500" />
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">기도 요청을 불러오는 중...</div>
  }

  if (prayerRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="mb-2 text-lg font-medium">기도 요청이 없습니다</p>
        <p className="text-muted-foreground">
          {answeredOnly 
            ? "응답된 기도 요청이 없습니다." 
            : "새로운 기도 요청을 작성해 보세요."}
        </p>
      </div>
    )
  }

  if (viewMode === "compact") {
    return (
      <div className="space-y-2">
        {prayerRequests.map((prayer) => (
          <div key={prayer.request_id} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
            <div className="flex items-center gap-2">
              {getStatusIcon(prayer.is_answered)}
              <span className="font-medium">{prayer.title}</span>
              
              {/* 응답 여부에 따른 상태 표시 */}
              {prayer.is_answered && prayer.answers && prayer.answers.length > 0 && (
                <Badge variant="outline" className="ml-1 text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/10">
                  응답됨
                </Badge>
              )}
              
              {/* 반응 수가 많은 경우 표시 */}
              {prayer.prayCount > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  <Heart className="h-3 w-3 mr-1" /> {prayer.prayCount}
                </Badge>
              )}
              
              {/* 댓글이 있는 경우 표시 */}
              {prayer.commentCount > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" /> {prayer.commentCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="rounded-sm">
                {getCategoryLabel(prayer.category_id)}
              </Badge>
              <span>{prayer.is_anonymous ? "익명" : prayer.users?.name}</span>
              <span className="text-xs">{new Date(prayer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        
        {/* 더보기 버튼 */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={loadMorePrayerRequests} 
              disabled={isLoadingMore}
              className="w-full max-w-xs"
            >
              {isLoadingMore ? "불러오는 중..." : "더 보기"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {prayerRequests.map((prayer) => (
          <Card key={prayer.request_id} className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(prayer.is_answered)}
                  <h3 className="text-base font-medium">{prayer.title}</h3>
                </div>
                <Badge variant="outline">{getCategoryLabel(prayer.category_id)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2 p-4 pt-2">
              <div className="text-sm whitespace-pre-line">{prayer.content}</div>
              
              {/* 성경구절 표시 */}
              {prayer.bible_verse && (
                <div className="mt-1 p-2 bg-muted/30 rounded-md flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{prayer.bible_verse.reference}</p>
                    <p className="text-sm italic">{prayer.bible_verse.text}</p>
                  </div>
                </div>
              )}
              
              {/* 응답 내용 표시 */}
              {prayer.is_answered && prayer.answers && prayer.answers.length > 0 && (
                <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">응답내용</span>
                  </div>
                  <p className="text-sm">{prayer.answers[0]?.content}</p>
                </div>
              )}
              
              {/* 반응 표시 */}
              {prayer.reactions && prayer.reactions.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(
                    prayer.reactions.reduce((acc: any, reaction: any) => {
                      if (!acc[reaction.reaction_type]) {
                        acc[reaction.reaction_type] = {
                          count: 0,
                          users: []
                        }
                      }
                      acc[reaction.reaction_type].count++
                      
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
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  {prayer.is_anonymous ? "익명" : prayer.users?.name} · {new Date(prayer.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> 
                    {(prayer.commentCount || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> 
                    {(prayer.prayCount || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 p-2">
              <Button 
                variant={userReactions[prayer.request_id]?.praying ? "default" : "outline"} 
                size="sm" 
                className="w-full"
                onClick={() => handlePrayClick(prayer.request_id)}
              >
                <Heart className="mr-1 h-4 w-4" /> 기도하기
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowComments(prayer.request_id)}
              >
                <MessageSquare className="mr-1 h-4 w-4" /> 댓글
              </Button>
              {(user?.id === prayer.user_id || showManageButtons) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user?.id === prayer.user_id && (
                      <>
                        <DropdownMenuItem onClick={() => handleMarkAsAnswered(prayer.request_id, prayer.is_answered)}>
                          {prayer.is_answered ? "응답 취소" : "응답 표시"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowResponse(prayer.request_id)}>
                          응답 내용 추가
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => setShowDeleteAlert(prayer.request_id)}>
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      <span className="text-destructive">삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardFooter>
          </Card>
        ))}
        
        {/* 더보기 버튼 */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={loadMorePrayerRequests} 
              disabled={isLoadingMore}
              className="w-full max-w-xs"
            >
              {isLoadingMore ? "불러오는 중..." : "더 보기"}
            </Button>
          </div>
        )}
        
        {/* 댓글 다이얼로그 */}
        {showComments && (
          <CommentSection 
            requestId={showComments} 
            open={!!showComments} 
            onOpenChange={() => setShowComments(null)}
          />
        )}
        
        {/* 기도 응답 다이얼로그 */}
        {showResponse && (
          <PrayerResponseDialog
            requestId={showResponse}
            open={!!showResponse}
            onOpenChange={() => setShowResponse(null)}
          />
        )}
        
        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={!!showDeleteAlert} onOpenChange={() => setShowDeleteAlert(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 기도 요청을 삭제하면 관련된 모든 댓글과 반응이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => showDeleteAlert && handleDeletePrayer(showDeleteAlert)} className="bg-destructive text-destructive-foreground">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // 기본 카드 뷰
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {prayerRequests.map((prayer) => (
          <Card key={prayer.request_id} className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {prayer.is_anonymous ? "익명" : prayer.users?.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {prayer.is_anonymous ? "익명" : prayer.users?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getCategoryLabel(prayer.category_id)}</Badge>
                  {prayer.is_answered && (
                    <Badge className="bg-green-500 text-white">응답</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="border-none">
                <AccordionItem value="content" className="border-none">
                  <AccordionTrigger className="py-0">
                    <h3 className="text-base font-medium">{prayer.title}</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 whitespace-pre-line text-sm">{prayer.content}</div>
                    
                    {/* 성경구절 표시 */}
                    {prayer.bible_verse && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-md flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium">{prayer.bible_verse.reference}</p>
                          <p className="text-sm italic mt-1">{prayer.bible_verse.text}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* 응답 내용 표시 */}
                    {prayer.is_answered && prayer.answers && prayer.answers.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">응답내용</span>
                        </div>
                        <p className="text-sm">{prayer.answers[0]?.content}</p>
                      </div>
                    )}
                    
                    {/* 반응 표시 */}
                    {prayer.reactions && prayer.reactions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(
                          prayer.reactions.reduce((acc: any, reaction: any) => {
                            if (!acc[reaction.reaction_type]) {
                              acc[reaction.reaction_type] = {
                                count: 0,
                                users: []
                              }
                            }
                            acc[reaction.reaction_type].count++
                            
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
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* 댓글 및 기도 정보 */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> 
                    {prayer.commentCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> 
                    {prayer.prayCount || 0}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 p-2">
              <Button 
                variant={userReactions[prayer.request_id]?.praying ? "default" : "outline"} 
                size="sm" 
                className="w-full"
                onClick={() => handlePrayClick(prayer.request_id)}
              >
                <Heart className="mr-1 h-4 w-4" /> 기도하기
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowComments(prayer.request_id)}
              >
                <MessageSquare className="mr-1 h-4 w-4" /> 댓글
              </Button>
              {(user?.id === prayer.user_id || showManageButtons) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user?.id === prayer.user_id && (
                      <>
                        <DropdownMenuItem onClick={() => handleMarkAsAnswered(prayer.request_id, prayer.is_answered)}>
                          {prayer.is_answered ? "응답 취소" : "응답 표시"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowResponse(prayer.request_id)}>
                          응답 내용 추가
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => setShowDeleteAlert(prayer.request_id)}>
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      <span className="text-destructive">삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* 더보기 버튼 */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMorePrayerRequests} 
            disabled={isLoadingMore}
            className="w-full max-w-xs"
          >
            {isLoadingMore ? "불러오는 중..." : "더 보기"}
          </Button>
        </div>
      )}
      
      {/* 댓글 다이얼로그 */}
      {showComments && (
        <CommentSection 
          requestId={showComments} 
          open={!!showComments} 
          onOpenChange={() => setShowComments(null)}
        />
      )}
      
      {/* 기도 응답 다이얼로그 */}
      {showResponse && (
        <PrayerResponseDialog
          requestId={showResponse}
          open={!!showResponse}
          onOpenChange={() => setShowResponse(null)}
        />
      )}
      
      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!showDeleteAlert} onOpenChange={() => setShowDeleteAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 기도 요청을 삭제하면 관련된 모든 댓글과 반응이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => showDeleteAlert && handleDeletePrayer(showDeleteAlert)} className="bg-destructive text-destructive-foreground">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
