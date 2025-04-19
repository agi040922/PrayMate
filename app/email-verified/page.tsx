"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CircleCheck } from "lucide-react"

export default function EmailVerifiedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  
  // 자동 리다이렉트 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      router.push("/login")
    }
  }, [countdown, router])
  
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50">
      <div className="relative z-10 w-full max-w-md px-4">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-slate-800">프레이니</h1>
        </Link>
        
        <Card className="w-full border shadow-lg">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CircleCheck className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">이메일 인증 완료!</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="mb-6 text-lg">
              축하합니다! 이메일 인증이 성공적으로 완료되었습니다.
            </p>
            
            <div className="mb-6 rounded-lg bg-green-50 p-4">
              <p className="text-green-800">
                이제 프레이니 서비스의 모든 기능을 이용하실 수 있습니다. 
                로그인하여 기도 요청을 등록하고 다른 사람들과 기도를 나눠보세요.
              </p>
            </div>
            
            <p className="text-sm text-slate-500">
              {countdown}초 후 자동으로 로그인 페이지로 이동합니다...
            </p>
          </CardContent>
          
          <CardFooter>
            <Button asChild variant="default" className="w-full">
              <Link href="/login">로그인 페이지로 이동</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 