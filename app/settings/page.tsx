"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Moon, Sun, Smartphone, Globe, Lock, LogOut, Trash2 } from "lucide-react"
import Link from "next/link"
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* 설정 페이지 헤더 */}
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/prayer-room">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">설정</h1>
      </div>

      {/* 설정 탭 */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          {/* 계정 설정 탭 */}
          <TabsTrigger value="account">계정</TabsTrigger>
          {/* 알림 설정 탭 */}
          <TabsTrigger value="notifications">알림</TabsTrigger>
          {/* 앱 설정 탭 */}
          <TabsTrigger value="appearance">화면 설정</TabsTrigger>
          {/* 개인정보 설정 탭 */}
          <TabsTrigger value="privacy">개인정보</TabsTrigger>
        </TabsList>

        {/* 계정 설정 탭 콘텐츠 */}
        <TabsContent value="account">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">계정 정보</h2>
              <p className="text-sm text-muted-foreground">계정 정보를 관리하고 업데이트하세요.</p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" defaultValue="김성실" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" defaultValue="sincere@example.com" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input id="phone" defaultValue="010-1234-5678" />
              </div>

              <Button className="w-full">정보 저장</Button>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold">비밀번호 변경</h2>
              <p className="text-sm text-muted-foreground">계정 보안을 위해 주기적으로 비밀번호를 변경하세요.</p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">현재 비밀번호</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">비밀번호 확인</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button className="w-full">비밀번호 변경</Button>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold text-destructive">계정 삭제</h2>
              <p className="text-sm text-muted-foreground">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
            </div>

            <Button variant="destructive" className="w-full" onClick={() => setShowDeleteAccountDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              계정 삭제
            </Button>
          </div>
        </TabsContent>

        {/* 알림 설정 탭 콘텐츠 */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">알림 설정</h2>
              <p className="text-sm text-muted-foreground">알림 수신 방법과 종류를 설정하세요.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">푸시 알림</Label>
                  <p className="text-sm text-muted-foreground">앱에서 푸시 알림을 받습니다.</p>
                </div>
                <Switch id="push-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">이메일 알림</Label>
                  <p className="text-sm text-muted-foreground">중요 알림을 이메일로 받습니다.</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prayer-comments">댓글 알림</Label>
                  <p className="text-sm text-muted-foreground">내 기도제목에 댓글이 달리면 알림을 받습니다.</p>
                </div>
                <Switch id="prayer-comments" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prayer-responses">기도 응답 알림</Label>
                  <p className="text-sm text-muted-foreground">기도 응답이 등록되면 알림을 받습니다.</p>
                </div>
                <Switch id="prayer-responses" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prayer-invites">초대 알림</Label>
                  <p className="text-sm text-muted-foreground">새로운 기도방 초대를 받으면 알림을 받습니다.</p>
                </div>
                <Switch id="prayer-invites" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system-notifications">시스템 알림</Label>
                  <p className="text-sm text-muted-foreground">서비스 업데이트 및 공지사항 알림을 받습니다.</p>
                </div>
                <Switch id="system-notifications" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 화면 설정 탭 콘텐츠 */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">화면 설정</h2>
              <p className="text-sm text-muted-foreground">앱의 테마와 화면 설정을 변경하세요.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>테마</Label>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 justify-start">
                    <Sun className="mr-2 h-4 w-4" />
                    라이트 모드
                  </Button>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Moon className="mr-2 h-4 w-4" />
                    다크 모드
                  </Button>
                  <Button variant="outline" className="flex-1 justify-start">
                    <Smartphone className="mr-2 h-4 w-4" />
                    시스템 설정
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="font-size">글꼴 크기</Label>
                  <span className="text-sm">중간</span>
                </div>
                <Slider id="font-size" defaultValue={[50]} max={100} step={1} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">언어</Label>
                <Select defaultValue="ko">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="언어 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-view">간결한 보기</Label>
                  <p className="text-sm text-muted-foreground">기도제목을 더 간결하게 표시합니다.</p>
                </div>
                <Switch id="compact-view" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 개인정보 설정 탭 콘텐츠 */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">개인정보 설정</h2>
              <p className="text-sm text-muted-foreground">개인정보 보호 및 보안 설정을 관리하세요.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profile-visibility">프로필 공개 설정</Label>
                  <p className="text-sm text-muted-foreground">내 프로필을 다른 사용자에게 공개합니다.</p>
                </div>
                <Switch id="profile-visibility" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prayer-visibility">기도제목 공개 설정</Label>
                  <p className="text-sm text-muted-foreground">내 기도제목을 방 구성원에게만 공개합니다.</p>
                </div>
                <Switch id="prayer-visibility" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-prayer-visibility">기본 기도제목 공개 범위</Label>
                <Select defaultValue="room">
                  <SelectTrigger id="default-prayer-visibility">
                    <SelectValue placeholder="공개 범위 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4" />
                        <span>전체 공개</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="room">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>방 구성원에게만</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>나만 보기</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">데이터 및 개인정보</h3>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />내 데이터 다운로드
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="mr-2 h-4 w-4" />
                    개인정보 처리방침
                  </Button>
                </div>
              </div>

              <Separator />

              <Button variant="outline" className="w-full justify-start text-destructive" asChild>
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 계정 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>계정 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 기도제목과 데이터가 영구적으로
              삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground">계정 삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// 필요한 컴포넌트 import
import { Users, Download } from "lucide-react"
