"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { getUserProfile, updateUserProfile } from "@/lib/supabase/users"
import { useAuth } from "@/lib/context/AuthContext"

interface ProfileEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  
  // 사용자 프로필 정보 로드
  useEffect(() => {
    if (open) {
      const loadProfile = async () => {
        try {
          const profile = await getUserProfile()
          console.log("로드된 프로필 정보:", profile)
          if (profile) {
            setName(profile.name || "")
            setContact(profile.contact || "")
          }
        } catch (error) {
          console.error("프로필 정보 로드 실패:", error)
          setError("프로필 정보를 불러오는데 실패했습니다.")
        }
      }
      
      loadProfile()
    }
  }, [open])
  
  // 프로필 저장 함수
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인 상태를 확인할 수 없습니다. 다시 로그인해주세요.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log("프로필 업데이트 시도:", { name, contact })
      
      const result = await updateUserProfile({
        name,
        contact
      })
      
      console.log("프로필 업데이트 결과:", result)
      
      toast({
        title: "프로필 업데이트 완료",
        description: "프로필 정보가 성공적으로 업데이트되었습니다."
      })
      
      onOpenChange(false)
      
      // 페이지 새로고침하여 변경사항 반영
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      console.error("프로필 업데이트 실패:", error)
      
      setError(error.message || "프로필 정보를 업데이트하는 중 오류가 발생했습니다.")
      
      toast({
        title: "업데이트 실패",
        description: error.message || "프로필 정보를 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 편집</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="name">이름</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="이름을 입력하세요"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="contact">연락처</Label>
            <Input 
              id="contact" 
              value={contact} 
              onChange={(e) => setContact(e.target.value)} 
              placeholder="연락처를 입력하세요"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 