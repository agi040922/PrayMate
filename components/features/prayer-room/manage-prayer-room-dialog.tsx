"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Copy, Globe, Lock, MoreHorizontal, UserPlus, X } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import {
  getPrayerRoomDetails, 
  updatePrayerRoom, 
  deletePrayerRoom,
  getRoomParticipants,
  updateParticipantRole,
  removeRoomParticipant
} from "@/lib/supabase/prayer-rooms"

// 기도방 데이터 타입 정의
interface PrayerRoom {
  room_id: string
  title: string
  description?: string
  is_public: boolean
  created_by: string
  created_at?: string
}

// 참여자 데이터 타입 정의
interface Participant {
  participant_id: string
  role: "admin" | "member"
  joined_at?: string
  user: {
    user_id: string
    name: string
    email: string
  }
}

interface ManagePrayerRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
}

export function ManagePrayerRoomDialog({
  open,
  onOpenChange,
  roomId
}: ManagePrayerRoomDialogProps) {
  const [activeTab, setActiveTab] = useState("settings")
  const [room, setRoom] = useState<PrayerRoom | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // 수정 가능한 기도방 정보
  const [roomTitle, setRoomTitle] = useState("")
  const [roomDescription, setRoomDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()

  // 기도방 정보 불러오기
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) return
      
      try {
        setLoading(true)
        
        // 기도방 정보 불러오기
        const roomData = await getPrayerRoomDetails(roomId)
        setRoom(roomData)
        
        // 상태 초기화
        setRoomTitle(roomData.title)
        setRoomDescription(roomData.description || "")
        setIsPublic(roomData.is_public)
        
        // 참여자 목록 불러오기
        const participantsData = await getRoomParticipants(roomId)
        setParticipants(participantsData)
      } catch (error) {
        console.error("기도방 정보 로딩 실패:", error)
        toast({
          title: "오류",
          description: "기도방 정보를 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (open) {
      fetchRoomDetails()
    }
  }, [roomId, open, toast])
  
  // 기도방 정보 업데이트
  const handleSaveSettings = async () => {
    if (!room || !user) return
    
    try {
      setSaving(true)
      
      await updatePrayerRoom(roomId, {
        title: roomTitle,
        description: roomDescription,
        is_public: isPublic
      })
      
      toast({
        title: "저장 완료",
        description: "기도방 설정이 업데이트되었습니다."
      })
      
      // 상태 업데이트
      setRoom({
        ...room,
        title: roomTitle,
        description: roomDescription,
        is_public: isPublic
      })
    } catch (error) {
      console.error("기도방 설정 저장 실패:", error)
      toast({
        title: "저장 실패",
        description: "설정을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // 기도방 삭제
  const handleDeleteRoom = async () => {
    if (!room || !user) return
    
    if (!confirm("정말로 이 기도방을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.")) {
      return
    }
    
    try {
      setSaving(true)
      
      await deletePrayerRoom(roomId)
      
      toast({
        title: "삭제 완료",
        description: "기도방이 삭제되었습니다."
      })
      
      onOpenChange(false)
      
      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("기도방 삭제 실패:", error)
      toast({
        title: "삭제 실패",
        description: "기도방을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // 참여자 역할 변경
  const handleChangeRole = async (participantId: string, newRole: "admin" | "member") => {
    try {
      await updateParticipantRole(participantId, newRole)
      
      // 상태 업데이트
      setParticipants(participants.map(p => 
        p.participant_id === participantId ? { ...p, role: newRole } : p
      ))
      
      toast({
        title: "역할 변경 완료",
        description: "참여자 역할이 변경되었습니다."
      })
    } catch (error) {
      console.error("참여자 역할 변경 실패:", error)
      toast({
        title: "역할 변경 실패", 
        description: "참여자 역할을 변경하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // 참여자 제거
  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm("정말로 이 참여자를 기도방에서 제거하시겠습니까?")) {
      return
    }
    
    try {
      await removeRoomParticipant(participantId)
      
      // 상태 업데이트
      setParticipants(participants.filter(p => p.participant_id !== participantId))
      
      toast({
        title: "참여자 제거 완료",
        description: "참여자가 기도방에서 제거되었습니다."
      })
    } catch (error) {
      console.error("참여자 제거 실패:", error)
      toast({
        title: "참여자 제거 실패",
        description: "참여자를 제거하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }
  
  // 초대 코드 복사
  const handleCopyInviteCode = () => {
    if (!roomId) return
    
    navigator.clipboard.writeText(roomId)
    
    toast({
      title: "초대 코드 복사 완료",
      description: "초대 코드가 클립보드에 복사되었습니다."
    })
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-12">
            <p>로딩 중...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>기도방 관리</DialogTitle>
            <DialogDescription>기도방 설정을 관리하고 멤버를 초대하세요.</DialogDescription>
          </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">기본 설정</TabsTrigger>
            <TabsTrigger value="members">멤버 관리</TabsTrigger>
            <TabsTrigger value="invite">초대하기</TabsTrigger>
            </TabsList>

          {/* 기본 설정 탭 */}
          <TabsContent value="settings" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="room-name">기도방 이름</Label>
                <Input
                  id="room-name"
                  value={roomTitle} 
                  onChange={(e) => setRoomTitle(e.target.value)} 
                  placeholder="기도방 이름"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room-description">기도방 설명</Label>
                <Textarea
                  id="room-description"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="기도방에 대한 설명을 입력하세요"
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="public-room">공개 기도방</Label>
                  <p className="text-xs text-muted-foreground">
                    공개 기도방은 검색을 통해 누구나 찾을 수 있고 참여할 수 있습니다.
                  </p>
                </div>
                <Switch 
                  id="public-room" 
                  checked={isPublic} 
                  onCheckedChange={setIsPublic} 
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDeleteRoom} disabled={saving}>
                  기도방 삭제
                </Button>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? "저장 중..." : "설정 저장"}
              </Button>
            </DialogFooter>
            </TabsContent>

            {/* 멤버 관리 탭 */}
            <TabsContent value="members" className="py-4">
              <div className="space-y-4">
              <div className="text-sm font-medium">총 {participants.length}명의 멤버</div>
              
              {participants.map((participant) => (
                <Card key={participant.participant_id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback>{participant.user.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{participant.user.name}</div>
                          <div className="text-sm text-muted-foreground">{participant.user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={participant.role === "admin" ? "default" : "outline"}>
                          {participant.role === "admin" ? "관리자" : "멤버"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {participant.role === "admin" ? (
                              <DropdownMenuItem onClick={() => handleChangeRole(participant.participant_id, "member")}>
                                멤버로 변경
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleChangeRole(participant.participant_id, "admin")}>
                                관리자로 변경
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleRemoveParticipant(participant.participant_id)}
                          >
                              기도방에서 제거
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="text-xs text-muted-foreground">
                      {participant.joined_at ? `참여일: ${new Date(participant.joined_at).toLocaleDateString()}` : ''}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {participants.length === 0 && (
                <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
                  <div>
                    <p>아직 참여자가 없습니다.</p>
                    <p className="text-sm">초대 탭에서 멤버를 초대해보세요.</p>
                  </div>
                </div>
              )}
              </div>
            </TabsContent>

            {/* 초대하기 탭 */}
            <TabsContent value="invite" className="py-4">
              <div className="space-y-4">
              <div className="space-y-1">
                <Label>초대 링크</Label>
                <div className="flex items-center space-x-2">
                  <Input value={`${window.location.origin}/join?room=${roomId}`} readOnly />
                  <Button variant="outline" size="icon" onClick={handleCopyInviteCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                <p className="text-xs text-muted-foreground">
                  이 링크를 공유하여 사람들을 기도방에 초대하세요.
                </p>
                </div>

              <div className="space-y-2">
                <Label>이메일로 초대하기</Label>
                <div className="flex items-center space-x-2">
                  <Input placeholder="초대할 사람의 이메일" type="email" />
                  <Button className="shrink-0">
                    <UserPlus className="mr-2 h-4 w-4" />
                    초대하기
                  </Button>
                </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
  )
}
