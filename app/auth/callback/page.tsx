"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { createUserProfile, checkUserProfileExists } from "@/lib/supabase/users"
import { useToast } from "@/components/ui/use-toast"

export default function AuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Auth 콜백 처리
        const { data, error } = await supabase.auth.getSession()
        
        if (error || !data.session) {
          throw error || new Error("인증 세션을 가져올 수 없습니다.")
        }
        
        const user = data.session.user
        
        // 사용자 정보가 users 테이블에 있는지 확인
        const hasProfile = await checkUserProfileExists(user.id)
        
        if (!hasProfile) {
          // 사용자 정보가 없는 경우 추가 정보 입력 페이지로 이동
          router.push("/auth/complete-profile")
        } else {
          // 이미 정보가 있는 경우 기도방으로 이동
          router.push("/prayer-room")
          toast({
            title: "로그인 성공",
            description: "환영합니다!",
          })
        }
      } catch (error) {
        console.error("Auth 콜백 오류:", error)
        toast({
          title: "로그인 실패",
          description: "인증 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, toast, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">로그인 처리 중...</h1>
        <p className="text-muted-foreground">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
} 