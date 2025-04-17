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
  removeRoomParticipant,
  leavePrayerRoom
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
  isAdmin?: boolean
}

export function ManagePrayerRoomDialog({
  open,
  onOpenChange,
  roomId,
  isAdmin = false
}: ManagePrayerRoomDialogProps) {
  const [activeTab, setActiveTab] = useState("settings")
  const [room, setRoom] = useState<PrayerRoom | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
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
        // 타입 변환을 통해 참여자 데이터 구조 맞추기
        const formattedParticipants = participantsData.map((participant: any) => ({
          participant_id: participant.participant_id,
          role: participant.role,
          joined_at: participant.joined_at,
          user: {
            user_id: participant.user.user_id || "",
            name: participant.user.name || "알 수 없음",
            email: participant.user.email || ""
          }
        }))
        setParticipants(formattedParticipants)
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
  
  // 방 ID 복사
  const handleCopyRoomId = () => {
    if (!roomId) return
    
    navigator.clipboard.writeText(roomId)
    
    toast({
      title: "방 ID 복사 완료",
      description: "방 ID가 클립보드에 복사되었습니다."
    })
  }

  // 기도방 나가기
  const handleLeaveRoom = async () => {
    if (!user) return
    
    // 현재 사용자가 관리자이고 관리자가 한 명인지 확인
    const isOnlyAdmin = isAdmin && 
      participants.filter(p => p.role === "admin").length === 1
      
    // 현재 참여자가 마지막 한 명인지 확인  
    const isLastParticipant = participants.length === 1
    
    let confirmMessage = "정말로 이 기도방을 나가시겠습니까?"
    
    if (isLastParticipant) {
      confirmMessage = "당신은 이 기도방의 마지막 참여자입니다. 나가면 기도방이 완전히 삭제됩니다. 계속하시겠습니까?"
    } else if (isOnlyAdmin) {
      confirmMessage = "당신은 이 기도방의 유일한 관리자입니다. 나가면 다른 멤버에게 관리자 권한이 넘어갑니다. 계속하시겠습니까?"
    }
    
    if (!window.confirm(confirmMessage)) {
      return
    }
    
    try {
      setIsLeaving(true)
      
      const result = await leavePrayerRoom(roomId, user.id)
      
      toast({
        title: "기도방 나가기 완료",
        description: result.action === "room_deleted" 
          ? "마지막 참여자로 기도방이 삭제되었습니다." 
          : "기도방에서 나왔습니다."
      })
      
      onOpenChange(false)
      
      // 페이지 새로고침 또는 상태 업데이트 로직 추가 필요
      window.location.reload()
    } catch (error) {
      console.error("기도방 나가기 실패:", error)
      toast({
        title: "기도방 나가기 실패",
        description: "기도방을 나가는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLeaving(false)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>기도방 정보</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-3/4 bg-muted rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-muted rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-muted rounded"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{isAdmin ? "기도방 관리" : "기도방 정보"}</DialogTitle>
            <DialogDescription>
              {isAdmin 
                ? "기도방 설정을 관리하고 멤버를 확인하세요." 
                : "기도방 정보와 참여 중인 멤버를 확인하세요."}
            </DialogDescription>
          </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">기본 정보</TabsTrigger>
            <TabsTrigger value="members">멤버 목록</TabsTrigger>
            </TabsList>

          {/* 기본 설정 탭 */}
          <TabsContent value="settings" className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-4">
              {isAdmin ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="room-name">기도방 이름</Label>
                    <Input
                      id="room-name"
                      value={roomTitle} 
                      onChange={(e) => setRoomTitle(e.target.value)} 
                      placeholder="기도방 이름"
                      className="min-h-[44px]"
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label>기도방 이름</Label>
                    <div className="text-sm p-2 bg-muted/20 rounded-md">{roomTitle}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>기도방 설명</Label>
                    <div className="text-sm p-2 bg-muted/20 rounded-md min-h-[80px]">{roomDescription || "설명이 없습니다."}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>공개 상태</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md">
                      {isPublic ? (
                        <>
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">공개 기도방</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">비공개 기도방</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {/* 방 ID 표시 및 복사 기능 */}
              <div className="space-y-2 pt-4 border-t">
                <Label>방 ID (초대용)</Label>
                <div className="flex items-center space-x-2">
                  <Input value={roomId} readOnly className="min-h-[44px]" />
                  <Button variant="outline" size="icon" onClick={handleCopyRoomId} className="min-h-[44px] min-w-[44px]">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  이 ID를 공유하여 사람들을 기도방에 초대하세요. 초대받은 사람은 '코드 검색'으로 참여할 수 있습니다.
                </p>
              </div>
            </div>
            {isAdmin ? (
              <DialogFooter className="flex flex-col gap-2 w-full mt-4 pt-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
                  <Button variant="destructive" onClick={handleDeleteRoom} disabled={saving || isLeaving} className="min-h-[44px]">
                    기도방 삭제
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={saving || isLeaving} className="min-h-[44px]">
                    {saving ? "저장 중..." : "설정 저장"}
                  </Button>
                </div>
              </DialogFooter>
            ) : null}
            </TabsContent>
            
            {/* 멤버 관리 탭 */}
            <TabsContent value="members" className="py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
              <div className="text-sm font-medium">총 {participants.length}명의 멤버</div>
              
              {participants.map((participant) => (
                <Card key={participant.participant_id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                        <Badge variant={participant.role === "admin" ? "default" : "outline"} className="min-h-[24px]">
                          {participant.role === "admin" ? "관리자" : "멤버"}
                        </Badge>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {participant.role === "admin" ? (
                                <DropdownMenuItem onClick={() => handleChangeRole(participant.participant_id, "member")} className="min-h-[36px]">
                                  멤버로 변경
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleChangeRole(participant.participant_id, "admin")} className="min-h-[36px]">
                                  관리자로 변경
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive min-h-[36px]"
                                onClick={() => handleRemoveParticipant(participant.participant_id)}
                              >
                                기도방에서 제거
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
                    <p className="text-sm">다른 사람들을 초대해보세요.</p>
                  </div>
                </div>
              )}
              </div>
              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive hover:bg-destructive/10 min-h-[44px]" 
                  onClick={handleLeaveRoom}
                  disabled={isLeaving}
                >
                  {isLeaving ? "처리 중..." : "기도방 나가기"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
  )
}
