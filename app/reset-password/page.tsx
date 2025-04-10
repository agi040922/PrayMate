"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // 필요한 파라미터가 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!searchParams?.has('token_hash')) {
      toast({
        title: "오류",
        description: "유효한 비밀번호 재설정 링크가 아닙니다.",
        variant: "destructive",
      })
      router.push('/login')
    }
  }, [searchParams, router, toast])
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // Supabase Auth API로 비밀번호 변경
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      setIsSuccess(true)
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "오류 발생",
        description: "비밀번호 변경 중 오류가 발생했습니다.",
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
            <CardTitle className="text-center">비밀번호 재설정</CardTitle>
          </CardHeader>
          
          {isSuccess ? (
            <CardContent>
              <div className="text-center">
                <p className="mb-4">
                  비밀번호가 성공적으로 변경되었습니다.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  새 비밀번호로 로그인해 주세요.
                </p>
                <Button asChild>
                  <Link href="/login">로그인 페이지로 이동</Link>
                </Button>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">새 비밀번호</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="새 비밀번호"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">비밀번호 확인</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="비밀번호 확인"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "처리 중..." : "비밀번호 변경"}
                  </Button>
                </div>
              </CardContent>
            </form>
          )}
          
          {!isSuccess && (
            <CardFooter className="flex justify-center">
              <Link href="/login" className="text-sm text-sky-600 hover:underline">
                로그인 페이지로 돌아가기
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
} 