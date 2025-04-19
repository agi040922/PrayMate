"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/context/AuthContext"
import { createUserProfile } from "@/lib/supabase/users"
import { useToast } from "@/components/ui/use-toast"

export default function CompleteProfilePage() {
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  
  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])
  
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name) {
      toast({
        title: "입력 오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    try {
      if (!user) {
        throw new Error("사용자 인증 정보가 없습니다.")
      }
      
      setIsLoading(true)
      
      // users 테이블에 프로필 저장
      const provider = user.app_metadata.provider || 'email'
      await createUserProfile(user.id, {
        email: user.email || '',
        name,
        contact,
        provider
      })
      
      toast({
        title: "프로필 완료",
        description: "추가 정보가 저장되었습니다. 환영합니다!",
      })
      
      // 기도방으로 이동
      router.push("/prayer-room")
    } catch (error) {
      console.error(error)
      toast({
        title: "프로필 저장 실패",
        description: "사용자 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    )
  }
  
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
        style={{ backgroundImage: "url('/placeholder.svg?height=1080&width=1920')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">프레이니</h1>
        </div>

        <Card className="w-full bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center">추가 정보 입력</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleCompleteProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">연락처</Label>
                <Input 
                  id="contact" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="연락처를 입력하세요"
                  disabled={isLoading}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">* 표시는 필수 입력 항목입니다</p>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "처리 중..." : "저장 후 계속하기"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 