"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// 사용자 후기 데이터
const testimonials = [
  {
    name: "김은혜",
    role: "교회 청년부",
    avatar: "/placeholder.svg?height=100&width=100&text=김은혜",
    content:
      "필그림 방에서 매주 함께 기도하면서 마음의 평안을 얻었어요. 다른 사람들의 기도제목을 보고 함께 기도하는 것이 큰 힘이 됩니다.",
  },
  {
    name: "박믿음",
    role: "목회자",
    avatar: "/placeholder.svg?height=100&width=100&text=박믿음",
    content:
      "교회 구성원들의 기도제목을 한눈에 볼 수 있어 중보기도하기 좋습니다. 응답된 기도를 기록하고 공유하는 기능이 특히 유용해요.",
  },
  {
    name: "이소망",
    role: "선교사",
    avatar: "/placeholder.svg?height=100&width=100&text=이소망",
    content:
      "해외에 있어도 한국의 가족들과 기도제목을 나눌 수 있어 감사합니다. 시간과 공간의 제약 없이 함께 기도할 수 있어요.",
  },
]

export function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.1 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <section id="testimonials" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">사용자 후기</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            기도모아를 통해 변화된 사용자들의 이야기를 들어보세요.
          </p>
        </div>

        <div ref={ref} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: index * 0.2 },
                },
              }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{testimonial.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
