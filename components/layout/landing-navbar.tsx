"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center">
          <span className={`text-xl font-bold ${isScrolled ? "text-sky-600" : "text-white"}`}>프레이니</span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#service-intro"
            className={`text-sm ${isScrolled ? "text-gray-700" : "text-white/90"} hover:text-sky-500`}
          >
            서비스 소개
          </Link>
          <Link
            href="#how-to-use"
            className={`text-sm ${isScrolled ? "text-gray-700" : "text-white/90"} hover:text-sky-500`}
          >
            사용법
          </Link>
          <Link
            href="#testimonials"
            className={`text-sm ${isScrolled ? "text-gray-700" : "text-white/90"} hover:text-sky-500`}
          >
            사용자 후기
          </Link>
          <Button asChild>
            <Link href="/login">로그인</Link>
          </Button>
        </nav>

        {/* 모바일 메뉴 */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className={isScrolled ? "h-6 w-6 text-gray-700" : "h-6 w-6 text-white"} />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="mt-8 flex flex-col gap-4">
              <Link href="#service-intro" className="text-lg font-medium">
                서비스 소개
              </Link>
              <Link href="#how-to-use" className="text-lg font-medium">
                사용법
              </Link>
              <Link href="#testimonials" className="text-lg font-medium">
                사용자 후기
              </Link>
              <Button className="mt-4" asChild>
                <Link href="/login">로그인</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
