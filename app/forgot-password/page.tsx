"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/supabase/users"
import { useToast } from "@/components/ui/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "입력 오류",
        description: "이메일을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await resetPassword(email)
      setIsSuccess(true)
      toast({
        title: "이메일 발송 완료",
        description: "비밀번호 재설정 링크가 이메일로 발송되었습니다.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "오류 발생",
        description: "비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
        <Link href="/" className="mb-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">기도모아</h1>
        </Link>

        <Card className="w-full bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center">비밀번호 찾기</CardTitle>
          </CardHeader>
          
          {isSuccess ? (
            <CardContent>
              <div className="text-center">
                <p className="mb-4">
                  비밀번호 재설정 링크가 <strong>{email}</strong>로 발송되었습니다.
                </p>
                <p className="text-sm text-muted-foreground">
                  이메일을 확인하여 비밀번호 재설정을 완료해주세요.
                </p>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="가입한 이메일 주소"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "처리 중..." : "비밀번호 재설정 이메일 보내기"}
                  </Button>
                </div>
              </CardContent>
            </form>
          )}
          
          <CardFooter className="flex justify-center">
            <Link href="/login" className="text-sm text-sky-600 hover:underline">
              로그인 페이지로 돌아가기
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 