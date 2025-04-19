"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// 갤러리 이미지 데이터
const galleryImages = [
  {
    src: "/images/prayer-gallery1.png",
    verse: "너희는 내 이름으로 무엇이든지 내게 구하면 내가 행하리라 (요한복음 14:14)",
  },
  {
    src: "/images/prayer-gallery2.png",
    verse:
      "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라 (빌립보서 4:6)",
  },
  {
    src: "/images/prayer-gallery3.png",
    verse: "쉬지 말고 기도하라 (데살로니가전서 5:17)",
  },
  {
    src: "/images/prayer-gallery4.png",
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg shadow-xl">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="relative h-full w-full">
                <Image
                  src={image.src}
                  alt={`기도 갤러리 이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6 md:p-8">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-base font-medium italic text-white sm:text-lg md:text-xl lg:text-2xl">
                    {image.verse}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* 네비게이션 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50 sm:h-12 sm:w-12"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50 sm:h-12 sm:w-12"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
          </Button>

          {/* 인디케이터 */}
          <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all sm:h-2.5 sm:w-2.5 ${
                  index === currentIndex ? "bg-white w-3 sm:w-4" : "bg-white/50"
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`${index + 1}번 이미지로 이동`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
