import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LandingNavbar } from "@/components/layout/landing-navbar"
import { LandingFooter } from "@/components/layout/landing-footer"
import { ServiceFeatures } from "@/components/pages/service-features"
import { Testimonials } from "@/components/pages/testimonials"
import { HowToUse } from "@/components/pages/how-to-use"
import { BibleVerseSection } from "@/components/pages/bible-verse-section"
import { PrayerGallery } from "@/components/pages/prayer-gallery"
import { ServiceIntro } from "@/components/pages/service-intro"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* 네비게이션 바 */}
      <LandingNavbar />

      {/* 히어로 섹션 */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* 배경 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/placeholder.svg?height=1080&width=1920')" }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 flex w-full max-w-md flex-col items-center px-4 text-center">
          <h1 className="animate-fade-in mb-4 text-4xl font-bold text-white md:text-5xl">
            기도는 연결입니다. 함께 기도해요.
          </h1>
          <p className="mb-8 text-lg text-white/90">기도제목을 나누고, 응답을 함께 경험하세요.</p>

          <div className="w-full space-y-4">
            <Button className="w-full animate-scale-in text-lg" size="lg" asChild>
              <Link href="/login">로그인</Link>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/60">또는</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="초대 코드 입력"
                className="bg-white/10 text-white placeholder:text-white/60"
              />
              <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20" asChild>
                <Link href="/prayer-room">입장</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 소개 섹션 */}
      <ServiceIntro />

      {/* 장점/특장점 섹션 */}
      <ServiceFeatures />

      {/* 기도 이미지 갤러리 */}
      <PrayerGallery />

      {/* 사용자 후기 섹션 */}
      <Testimonials />

      {/* 사용법 설명 섹션 */}
      <HowToUse />

      {/* 성경 말씀 인용 섹션 */}
      <BibleVerseSection />

      {/* 푸터 */}
      <LandingFooter />
    </div>
  )
}
