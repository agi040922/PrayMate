"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Comment {
  id: string
  author: string
  authorAvatar: string
  content: string
  date: string
  likes: number
}

// 샘플 댓글 데이터
const commentsData: Record<string, Comment[]> = {
  "1": [
    {
      id: "c1",
      author: "박은혜",
      authorAvatar: "",
      content: "함께 기도하겠습니다. 속히 회복되시길 바랍니다.",
      date: "2023-04-08",
      likes: 3,
    },
    {
      id: "c2",
      author: "이소망",
      authorAvatar: "",
      content: "저희 아버지도 비슷한 상황이셨는데 많이 회복되셨어요. 힘내세요!",
      date: "2023-04-09",
      likes: 2,
    },
    {
      id: "c3",
      author: "김믿음",
      authorAvatar: "",
      content: "말씀과 함께 기도드립니다. '여호와는 나의 목자시니 내게 부족함이 없으리로다'",
      date: "2023-04-10",
      likes: 5,
    },
  ],
  "3": [
    {
      id: "c4",
      author: "최사랑",
      authorAvatar: "",
      content: "선교사님들의 안전과 사역을 위해 매일 기도하고 있습니다.",
      date: "2023-04-06",
      likes: 7,
    },
    {
      id: "c5",
      author: "정평안",
      authorAvatar: "",
      content: "현지 소식 공유해주시면 더 구체적으로 기도할 수 있을 것 같아요.",
      date: "2023-04-07",
      likes: 4,
    },
  ],
}

interface CommentSectionProps {
  prayerId: string
  onClose: () => void
}

export function CommentSection({ prayerId, onClose }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>(commentsData[prayerId] || [])
  const [likedComments, setLikedComments] = useState<string[]>([])

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: "나",
      authorAvatar: "",
      content: newComment,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  const handleLikeComment = (commentId: string) => {
    if (likedComments.includes(commentId)) {
      setLikedComments(likedComments.filter((id) => id !== commentId))
      setComments(
        comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes - 1 } : comment)),
      )
    } else {
      setLikedComments([...likedComments, commentId])
      setComments(
        comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
      )
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>댓글</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorAvatar || "/placeholder-user.jpg"} alt={comment.author} />
                    <AvatarFallback>{comment.author.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{comment.author}</div>
                      <div className="text-xs text-muted-foreground">{comment.date}</div>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <ThumbsUp
                          className={`mr-1 h-3 w-3 ${likedComments.includes(comment.id) ? "fill-current text-sky-600" : ""}`}
                        />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Textarea
            placeholder="격려의 댓글을 남겨보세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
            댓글 작성
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
