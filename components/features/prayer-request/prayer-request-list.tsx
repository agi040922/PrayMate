"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageSquare, Heart, CheckCircle, Clock, Pencil, Trash2, MoreVertical } from "lucide-react"
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

interface PrayerRequest {
  id: string
  title: string
  content: string
  bibleVerse?: string
  author: string
  authorAvatar: string
  category: string
  date: string
  prayCount: number
  commentCount: number
  status: "praying" | "answered" | null
  response?: string
  isOwner?: boolean
}

const prayerRequests: PrayerRequest[] = [
  {
    id: "1",
    title: "아버지의 건강 회복을 위해 기도해주세요",
    content: "아버지께서 최근 건강이 좋지 않으셔서 병원에 다니고 계십니다. 빠른 회복을 위해 기도 부탁드립니다.",
    bibleVerse: "시편 30:2 여호와 내 하나님이여 내가 주께 부르짖으매 나를 고치셨나이다",
    author: "김성실",
    authorAvatar: "",
    category: "personal",
    date: "2023-04-08",
    prayCount: 12,
    commentCount: 3,
    status: "praying",
    isOwner: true,
  },
  {
    id: "2",
    title: "취업을 위한 기도 부탁드립니다",
    content: "다음 주에 중요한 면접이 있습니다. 하나님의 인도하심을 구합니다.",
    author: "이믿음",
    authorAvatar: "",
    category: "personal",
    date: "2023-04-07",
    prayCount: 8,
    commentCount: 1,
    status: null,
    isOwner: true,
  },
  {
    id: "3",
    title: "선교사님들의 안전과 사역을 위해",
    content: "해외에서 사역 중인 선교사님들의 안전과 사역의 열매를 위해 기도해주세요.",
    bibleVerse: "마태복음 28:19-20 그러므로 너희는 가서 모든 민족을 제자로 삼아...",
    author: "박소망",
    authorAvatar: "",
    category: "intercession",
    date: "2023-04-05",
    prayCount: 24,
    commentCount: 5,
    status: "answered",
    response:
      "선교사님들이 안전하게 현지에 도착하셨고, 현지인들과의 첫 만남도 은혜롭게 진행되었습니다. 계속해서 사역의 열매를 위해 기도해주세요.",
    isOwner: false,
  },
  {
    id: "4",
    title: "교회 청년부 수련회를 위한 기도",
    content: "다음 달에 있을 청년부 수련회가 은혜 가운데 진행될 수 있도록 기도 부탁드립니다.",
    author: "정은혜",
    authorAvatar: "",
    category: "community",
    date: "2023-04-04",
    prayCount: 15,
    commentCount: 2,
    status: "praying",
    isOwner: false,
  },
  {
    id: "5",
    title: "새 직장에 감사드립니다",
    content: "오랜 기도 끝에 새 직장을 허락해주신 하나님께 감사드립니다. 앞으로의 사역도 인도해주시길 기도합니다.",
    bibleVerse: "시편 107:1 여호와께 감사하라 그는 선하시며 그의 인자하심이 영원함이로다",
    author: "최감사",
    authorAvatar: "",
    category: "thanksgiving",
    date: "2023-04-03",
    prayCount: 10,
    commentCount: 0,
    status: "answered",
    response: "기도해주신 모든 분들께 감사드립니다. 좋은 회사에 취직하게 되었고 다음 주부터 출근합니다!",
    isOwner: true,
  },
]

interface PrayerRequestListProps {
  category?: string
  viewMode: "card" | "list" | "compact"
  showManageButtons?: boolean
  answeredOnly?: boolean
}

export function PrayerRequestList({
  category = "all",
  viewMode = "card",
  showManageButtons = false,
  answeredOnly = false,
}: PrayerRequestListProps) {
  const [prayedItems, setPrayedItems] = useState<string[]>([])
  const [showComments, setShowComments] = useState<string | null>(null)
  const [showResponse, setShowResponse] = useState<string | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null)

  // 필터링된 기도제목 목록
  const filteredRequests = prayerRequests.filter(
    (prayer) => (category === "all" || prayer.category === category) && (!answeredOnly || prayer.status === "answered"),
  )

  // 기도 버튼 클릭 함수
  const handlePrayClick = (id: string) => {
    if (prayedItems.includes(id)) {
      setPrayedItems(prayedItems.filter((item) => item !== id))
    } else {
      setPrayedItems([...prayedItems, id])
    }
  }

  // 카테고리 라벨 가져오기 함수
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "personal":
        return "개인"
      case "community":
        return "공동체"
      case "thanksgiving":
        return "감사"
      case "intercession":
        return "중보기도"
      default:
        return category
    }
  }

  // 상태 아이콘 가져오기 함수
  const getStatusIcon = (status: "praying" | "answered" | null) => {
    switch (status) {
      case "praying":
        return <Clock className="h-4 w-4 text-sky-500" />
      case "answered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  // 기도제목 삭제 함수
  const handleDeletePrayer = (id: string) => {
    // 실제 구현에서는 API 호출 등으로 삭제 처리
    console.log("기도제목 삭제:", id)
    setShowDeleteAlert(null)
  }

  if (viewMode === "compact") {
    return (
      <div className="space-y-2">
        {filteredRequests.map((prayer) => (
          <div key={prayer.id} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
            <div className="flex items-center gap-2">
              {getStatusIcon(prayer.status)}
              <span className="font-medium">{prayer.title}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="rounded-sm">
                {getCategoryLabel(prayer.category)}
              </Badge>
              <span>{prayer.author}</span>

              {/* 관리 버튼 (자신의 기도제목인 경우) */}
              {showManageButtons && prayer.isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteAlert(prayer.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {filteredRequests.map((prayer) => (
            <AccordionItem key={prayer.id} value={prayer.id} className="border rounded-lg px-4 py-2 mb-4">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="flex flex-1 items-start text-left">
                  <div className="mr-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={prayer.authorAvatar || "/placeholder-user.jpg"} alt={prayer.author} />
                      <AvatarFallback>{prayer.author.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(prayer.status)}
                      <h3 className="font-medium text-base">{prayer.title}</h3>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{prayer.author}</span>
                      <span>•</span>
                      <Badge variant="outline" className="rounded-sm">
                        {getCategoryLabel(prayer.category)}
                      </Badge>
                      <span>•</span>
                      <span>{prayer.date}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="grid gap-4">
                  <p className="text-sm">{prayer.content}</p>
                  {prayer.bibleVerse && (
                    <div className="rounded-md bg-muted p-3 text-sm italic">"{prayer.bibleVerse}"</div>
                  )}

                  {prayer.status === "answered" && prayer.response && (
                    <div className="rounded-md bg-green-50 p-3 text-sm">
                      <div className="font-medium text-green-700 mb-1">🙏 기도응답</div>
                      <p>{prayer.response}</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      {/* 댓글 버튼 */}
                      <Button variant="ghost" size="sm" onClick={() => setShowComments(prayer.id)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        댓글 ({prayer.commentCount})
                      </Button>

                      {/* 응답 기록 버튼 (자신의 기도제목이고 응답되지 않은 경우) */}
                      {prayer.isOwner && prayer.status !== "answered" && (
                        <Button variant="ghost" size="sm" onClick={() => setShowResponse(prayer.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          응답 기록
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {/* 관리 버튼 (자신의 기도제목인 경우) */}
                      {showManageButtons && prayer.isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="mr-2 h-4 w-4" />
                              관리
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowDeleteAlert(prayer.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {/* 함께 기도 버튼 */}
                      <Button
                        variant={prayedItems.includes(prayer.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePrayClick(prayer.id)}
                        className={prayedItems.includes(prayer.id) ? "bg-sky-600 hover:bg-sky-700" : ""}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        함께 기도합니다 ({prayer.prayCount + (prayedItems.includes(prayer.id) ? 1 : 0)})
                      </Button>
                    </div>
                  </div>

                  {/* 댓글 섹션 */}
                  {showComments === prayer.id && (
                    <CommentSection prayerId={prayer.id} onClose={() => setShowComments(null)} />
                  )}

                  {/* 응답 기록 다이얼로그 */}
                  {showResponse === prayer.id && (
                    <PrayerResponseDialog prayerId={prayer.id} onClose={() => setShowResponse(null)} />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    )
  }

  // Card view (default)
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {filteredRequests.map((prayer) => (
        <Card key={prayer.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={prayer.authorAvatar || "/placeholder-user.jpg"} alt={prayer.author} />
                  <AvatarFallback>{prayer.author.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(prayer.status)}
                    <h3 className="font-medium">{prayer.title}</h3>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{prayer.author}</span>
                    <span>•</span>
                    <Badge variant="outline" className="rounded-sm text-xs">
                      {getCategoryLabel(prayer.category)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 관리 버튼 (자신의 기도제목인 경우) */}
              {showManageButtons && prayer.isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteAlert(prayer.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm line-clamp-3">{prayer.content}</p>
            {prayer.status === "answered" && prayer.response && (
              <div className="mt-2 rounded-md bg-green-50 p-2 text-xs">
                <span className="font-medium text-green-700">🙏 응답:</span> {prayer.response.substring(0, 60)}...
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setShowComments(prayer.id)}
              >
                <MessageSquare className="h-3 w-3" />
                {prayer.commentCount}
              </Button>
            </div>
            <Button
              variant={prayedItems.includes(prayer.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePrayClick(prayer.id)}
              className={`h-8 text-xs ${prayedItems.includes(prayer.id) ? "bg-sky-600 hover:bg-sky-700" : ""}`}
            >
              <Heart className="mr-1 h-3 w-3" />
              함께 기도 ({prayer.prayCount + (prayedItems.includes(prayer.id) ? 1 : 0)})
            </Button>
          </CardFooter>

          {/* 댓글 섹션 */}
          {showComments === prayer.id && <CommentSection prayerId={prayer.id} onClose={() => setShowComments(null)} />}
        </Card>
      ))}

      {/* 기도제목 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!showDeleteAlert} onOpenChange={() => setShowDeleteAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기도제목 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 기도제목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeletePrayer(showDeleteAlert!)}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
