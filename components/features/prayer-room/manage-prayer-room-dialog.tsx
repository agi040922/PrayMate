"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Copy, UserPlus, Settings, Users, Trash2 } from "lucide-react"
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

interface ManagePrayerRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
}

// 샘플 기도방 데이터
const roomData = {
  id: "1",
  name: "가족을 위한 기도",
  description: "우리 가족을 위한 기도제목을 나누는 공간입니다.",
  isPrivate: true,
  inviteCode: "FAM123",
  members: [
    { id: "1", name: "김성실", role: "admin", avatar: "" },
    { id: "2", name: "박은혜", role: "member", avatar: "" },
    { id: "3", name: "이소망", role: "member", avatar: "" },
    { id: "4", name: "정믿음", role: "member", avatar: "" },
  ],
}

export function ManagePrayerRoomDialog({ open, onOpenChange, roomId }: ManagePrayerRoomDialogProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [roomName, setRoomName] = useState(roomData.name)
  const [roomDescription, setRoomDescription] = useState(roomData.description)
  const [isPrivate, setIsPrivate] = useState(roomData.isPrivate)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showRemoveMemberAlert, setShowRemoveMemberAlert] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  // 초대 코드 복사 함수
  const copyInviteCode = () => {
    navigator.clipboard.writeText(roomData.inviteCode)
    // 복사 성공 알림 표시 (실제 구현에서는 토스트 메시지 등으로 구현)
    console.log("초대 코드가 클립보드에 복사되었습니다.")
  }

  // 멤버 삭제 함수
  const handleRemoveMember = (memberId: string) => {
    setSelectedMemberId(memberId)
    setShowRemoveMemberAlert(true)
  }

  // 멤버 삭제 확인 함수
  const confirmRemoveMember = () => {
    // 실제 구현에서는 API 호출 등으로 멤버 삭제 처리
    console.log(`멤버 ID: ${selectedMemberId} 삭제 요청`)
    setShowRemoveMemberAlert(false)
  }

  // 기도방 삭제 함수
  const handleDeleteRoom = () => {
    // 실제 구현에서는 API 호출 등으로 기도방 삭제 처리
    console.log(`기도방 ID: ${roomId} 삭제 요청`)
    setShowDeleteAlert(false)
    onOpenChange(false)
  }

  // 설정 저장 함수
  const saveSettings = () => {
    // 실제 구현에서는 API 호출 등으로 설정 저장 처리
    console.log("기도방 설정 저장:", { roomName, roomDescription, isPrivate })
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>기도방 관리</DialogTitle>
            <DialogDescription>기도방 설정을 관리하고 멤버를 초대하세요.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">
                <Settings className="mr-2 h-4 w-4" />
                일반 설정
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="mr-2 h-4 w-4" />
                멤버 관리
              </TabsTrigger>
              <TabsTrigger value="invite">
                <UserPlus className="mr-2 h-4 w-4" />
                초대하기
              </TabsTrigger>
            </TabsList>

            {/* 일반 설정 탭 */}
            <TabsContent value="general" className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="room-name">기도방 이름</Label>
                <Input
                  id="room-name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="기도방 이름을 입력하세요"
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
                  <Label htmlFor="private-room">비공개 기도방</Label>
                  <p className="text-xs text-muted-foreground">활성화하면 초대를 통해서만 참여할 수 있습니다.</p>
                </div>
                <Switch id="private-room" checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>

              <div className="pt-4">
                <Button variant="destructive" onClick={() => setShowDeleteAlert(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  기도방 삭제
                </Button>
              </div>
            </TabsContent>

            {/* 멤버 관리 탭 */}
            <TabsContent value="members" className="py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">멤버 목록</h3>
                  <p className="text-sm text-muted-foreground">총 {roomData.members.length}명</p>
                </div>

                <div className="space-y-2">
                  {roomData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || "/placeholder-user.jpg"} alt={member.name} />
                          <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role === "admin" ? "관리자" : "멤버"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role === "admin" ? (
                          <Badge>관리자</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* 초대하기 탭 */}
            <TabsContent value="invite" className="py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">초대 코드</h3>
                  <p className="text-sm text-muted-foreground">
                    아래 코드를 공유하여 다른 사람들을 기도방에 초대하세요.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input value={roomData.inviteCode} readOnly className="pr-10" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={copyInviteCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={copyInviteCode}>복사</Button>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium">이메일로 초대하기</h3>
                  <p className="text-sm text-muted-foreground">이메일 주소를 입력하여 직접 초대장을 보내세요.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Input type="email" placeholder="이메일 주소" className="flex-1" />
                  <Button>초대장 보내기</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={saveSettings}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 멤버 삭제 확인 다이얼로그 */}
      <AlertDialog open={showRemoveMemberAlert} onOpenChange={setShowRemoveMemberAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 멤버를 기도방에서 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMember} className="bg-destructive text-destructive-foreground">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 기도방 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기도방 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 기도방을 삭제하시겠습니까? 모든 기도제목과 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수
              없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive text-destructive-foreground">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
