"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SocialLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [provider, setProvider] = useState<string | null>(null)

  useEffect(() => {
    const providerParam = searchParams.get("provider")
    setProvider(providerParam)
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 여기에 소셜 로그인 후 추가 정보 저장 로직 구현
    router.push("/prayer-room")
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
            <CardTitle>추가 정보 입력</CardTitle>
            <CardDescription>
              {provider === "google" ? "Google" : "Kakao"} 계정으로 로그인이 완료되었습니다. 서비스 이용을 위해 추가
              정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" placeholder="이름을 입력하세요" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일 주소"
                  defaultValue={provider === "google" ? "example@gmail.com" : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input id="phone" placeholder="010-0000-0000" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                정보 저장 및 시작하기
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
