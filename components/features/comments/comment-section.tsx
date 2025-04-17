"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import { getComments, addComment, deleteComment } from "@/lib/supabase/prayer-requests"
import { Trash2 } from "lucide-react"

interface CommentSectionProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommentSection({ requestId, open, onOpenChange }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()
  
  // 댓글 목록 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      if (!requestId) return
      
      try {
        setIsLoading(true)
        const data = await getComments(requestId)
        setComments(data || [])
      } catch (error) {
        console.error("댓글 로딩 실패:", error)
        toast({
          title: "댓글 로딩 실패",
          description: "댓글을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (open) {
      fetchComments()
    }
  }, [requestId, open, toast])
  
  // 새 댓글 등록
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "댓글을 작성하려면 로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }
    
    if (!newComment.trim()) {
      toast({
        title: "입력 오류",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const comment = await addComment({
        request_id: requestId,
        user_id: user.id,
        content: newComment
      })
      
      // 사용자 정보 추가
      comment.user = {
        user_id: user.id,
        name: user.user_metadata?.name || user.email,
        email: user.email
      }
      
      // 댓글 목록 업데이트
      setComments([...comments, comment])
      setNewComment("")
      
      toast({
        title: "댓글 등록 완료",
        description: "댓글이 성공적으로 등록되었습니다."
      })
    } catch (error: any) {
      console.error("댓글 등록 실패:", error)
      toast({
        title: "댓글 등록 실패",
        description: error.message || "댓글 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    
    try {
      await deleteComment(commentId)
      
      // 댓글 목록 업데이트
      setComments(comments.filter(comment => comment.comment_id !== commentId))
      
      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 삭제되었습니다."
      })
    } catch (error: any) {
      console.error("댓글 삭제 실패:", error)
      toast({
        title: "댓글 삭제 실패",
        description: error.message || "댓글 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>댓글</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">댓글을 불러오는 중...</div>
        ) : (
          <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-1 pr-4">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <p className="text-muted-foreground">첫 댓글을 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.comment_id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={comment.user?.name} />
                        <AvatarFallback>{comment.user?.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <p className="text-sm font-semibold">{comment.user?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>
                          {user?.id === comment.user_id && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleDeleteComment(comment.comment_id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="mt-4 border-t pt-4">
              <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
                <Textarea
                  placeholder="댓글을 입력하세요"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "등록 중..." : "댓글 등록"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
