"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import { 
  NotificationSetting,
  getUserNotificationSettings, 
  updateUserNotificationSettings 
} from "@/lib/supabase/notifications"

interface NotificationSettingsProps {
  className?: string
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()

  // 알림 설정 조회
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        const data = await getUserNotificationSettings(user.id)
        setSettings(data)
      } catch (error) {
        console.error("알림 설정 로딩 실패:", error)
        toast({
          title: "설정 로딩 실패",
          description: "알림 설정을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSettings()
  }, [user, toast])

  // 알림 설정 업데이트
  const handleSettingChange = async (
    setting: keyof Omit<NotificationSetting, 'setting_id' | 'user_id' | 'updated_at'>,
    value: boolean
  ) => {
    if (!user || !settings) return
    
    // 로컬 상태 낙관적 업데이트
    setSettings({
      ...settings,
      [setting]: value,
    })
    
    setIsSaving(true)
    
    try {
      await updateUserNotificationSettings(user.id, {
        [setting]: value,
      })
      
      toast({
        title: "설정 저장 완료",
        description: "알림 설정이 저장되었습니다.",
      })
    } catch (error) {
      console.error("알림 설정 저장 실패:", error)
      
      // 오류 발생 시 원래 값으로 복원
      setSettings({
        ...settings,
        [setting]: !value,
      })
      
      toast({
        title: "설정 저장 실패",
        description: "알림 설정을 저장하는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">알림 설정을 불러올 수 없습니다.</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>
          알림을 받을 항목을 선택하세요. 다른 사용자와의 상호작용과 기도제목 관련 알림을 관리할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="comment_notification">댓글 알림</Label>
            <p className="text-sm text-muted-foreground">
              기도제목에 댓글이 달리면 알림을 받습니다.
            </p>
          </div>
          <Switch
            id="comment_notification"
            checked={settings.comment_notification}
            onCheckedChange={(value) => handleSettingChange('comment_notification', value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="prayer_notification">기도 반응 알림</Label>
            <p className="text-sm text-muted-foreground">
              다른 사용자가 내 기도제목에 함께 기도한다면 알림을 받습니다.
            </p>
          </div>
          <Switch
            id="prayer_notification"
            checked={settings.prayer_notification}
            onCheckedChange={(value) => handleSettingChange('prayer_notification', value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="answer_notification">기도 응답 알림</Label>
            <p className="text-sm text-muted-foreground">
              내가 속한 기도방의 기도제목에 응답이 등록되면 알림을 받습니다.
            </p>
          </div>
          <Switch
            id="answer_notification"
            checked={settings.answer_notification}
            onCheckedChange={(value) => handleSettingChange('answer_notification', value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="invite_notification">초대 알림</Label>
            <p className="text-sm text-muted-foreground">
              새로운 기도방에 초대받았을 때 알림을 받습니다.
            </p>
          </div>
          <Switch
            id="invite_notification"
            checked={settings.invite_notification}
            onCheckedChange={(value) => handleSettingChange('invite_notification', value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="system_notification">시스템 알림</Label>
            <p className="text-sm text-muted-foreground">
              서비스 업데이트 및 중요 공지사항을 알림으로 받습니다.
            </p>
          </div>
          <Switch
            id="system_notification"
            checked={settings.system_notification}
            onCheckedChange={(value) => handleSettingChange('system_notification', value)}
            disabled={isSaving}
          />
        </div>
      </CardContent>
    </Card>
  )
} 