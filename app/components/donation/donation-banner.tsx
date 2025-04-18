"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function DonationBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  
  // 배너가 1초 후에 나타나도록 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const handleClose = () => {
    setIsVisible(false)
    
    // 애니메이션이 끝나면 완전히 숨김 처리
    setTimeout(() => {
      setIsHidden(true)
    }, 500)
    
    // 브라우저 세션 동안 다시 보이지 않도록 설정
    sessionStorage.setItem("donationBannerClosed", "true")
  }
  
  // 이미 닫은 적이 있으면 보이지 않음
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isClosed = sessionStorage.getItem("donationBannerClosed") === "true"
      if (isClosed) {
        setIsHidden(true)
      }
    }
  }, [])
  
  if (isHidden) return null
  
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transform bg-gradient-to-r from-sky-50 to-violet-50 p-4 shadow-lg transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      )}
    >
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center">
          <span className="mr-2 text-lg">🙏</span>
          <div className="text-center sm:text-left">
            <p className="font-medium text-slate-800">
              "당신의 기도가 누군가의 삶을 바꿉니다"
            </p>
            <p className="text-sm text-slate-600">기도모아는 후원으로 운영되고 있어요. 💖 함께해 주시겠어요?</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            asChild
            className="bg-blue-600 transition-all hover:bg-blue-700 hover:shadow-md"
            size="sm"
          >
            <Link href="/support">후원하기</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-slate-600 hover:text-slate-900"
          >
            지금은 괜찮아요
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-900"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 