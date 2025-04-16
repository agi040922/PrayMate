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
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface AnsweredPrayerCardProps {
  prayer: any
}

export function AnsweredPrayerCard({ prayer }: AnsweredPrayerCardProps) {
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