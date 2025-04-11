"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// 갤러리 이미지 데이터
const galleryImages = [
  {
    src: "/placeholder.svg?height=600&width=1200&text=기도하는+모습+1",
    verse: "너희는 내 이름으로 무엇이든지 내게 구하면 내가 행하리라 (요한복음 14:14)",
  },
  {
    src: "/placeholder.svg?height=600&width=1200&text=기도하는+모습+2",
    verse:
      "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라 (빌립보서 4:6)",
  },
  {
    src: "/placeholder.svg?height=600&width=1200&text=기도하는+모습+3",
    verse: "쉬지 말고 기도하라 (데살로니가전서 5:17)",
  },
  {
    src: "/placeholder.svg?height=600&width=1200&text=기도하는+모습+4",
    verse: "그러므로 너희는 이렇게 기도하라 하늘에 계신 우리 아버지여 이름이 거룩히 여김을 받으시오며 (마태복음 6:9)",
  },
]

export function PrayerGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // 자동 슬라이드 기능
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % galleryImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // 이전 이미지로 이동
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1))
  }

  // 다음 이미지로 이동
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % galleryImages.length)
  }

  return (
    <section className="relative overflow-hidden py-10">
      <div className="relative h-[500px] w-full">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image.src})` }}>
              <div className="absolute inset-0 bg-black/30" />
            </div>
            <div className="absolute bottom-10 left-0 right-0 mx-auto max-w-3xl px-4 text-center">
              <p className="text-lg font-medium italic text-white md:text-xl">{image.verse}</p>
            </div>
          </div>
        ))}

        {/* 네비게이션 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={goToNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        {/* 인디케이터 */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
