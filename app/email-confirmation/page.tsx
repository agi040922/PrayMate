"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CircleCheck, Mail } from "lucide-react"

export default function EmailConfirmationPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [countdown, setCountdown] = useState(60)
  
  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])
  
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50">
      <div className="relative z-10 w-full max-w-md px-4">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-slate-800">기도모아</h1>
        </Link>
        
        <Card className="w-full border shadow-lg">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">이메일 인증이 필요합니다</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="mb-6">
              <span className="font-medium text-slate-900">{email}</span> 주소로 인증 이메일을 발송했습니다.
            </p>
            
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-left">
              <h3 className="mb-2 font-semibold text-slate-900">다음 단계:</h3>
              <ol className="ml-5 list-decimal text-slate-700">
                <li className="mb-1">이메일함을 확인해주세요</li>
                <li className="mb-1">기도모아에서 보낸 인증 이메일을 열어주세요</li>
                <li className="mb-1">이메일에 있는 인증 링크를 클릭해주세요</li>
                <li>인증이 완료되면 로그인할 수 있습니다</li>
              </ol>
            </div>
            
            <div className="mb-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p>이메일을 받지 못하셨나요? 스팸함을 확인해보세요. 이메일이 도착하기까지 {countdown > 0 ? `${countdown}초` : "몇 분"} 정도 소요될 수 있습니다.</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3">
            <Button asChild variant="default" className="w-full">
              <Link href="/login">로그인 화면으로 돌아가기</Link>
            </Button>
            <p className="text-center text-xs text-slate-500">
              문제가 계속되면 <Link href="/support" className="text-blue-600 hover:underline">고객센터</Link>로 문의해주세요
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 