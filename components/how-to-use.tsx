"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { PlusCircle, MessageSquare, Eye, CheckCircle } from "lucide-react"

// 사용법 단계 데이터
const steps = [
  {
    icon: <PlusCircle className="h-12 w-12 text-sky-500" />,
    title: "방 만들기",
    description: "기도방을 만들고 구성원을 초대하세요.",
  },
  {
    icon: <MessageSquare className="h-12 w-12 text-sky-500" />,
    title: "기도제목 등록",
    description: "기도제목을 작성하고 공유하세요.",
  },
  {
    icon: <Eye className="h-12 w-12 text-sky-500" />,
    title: "함께 보기",
    description: "다른 사람들의 기도제목을 확인하고 함께 기도하세요.",
  },
  {
    icon: <CheckCircle className="h-12 w-12 text-sky-500" />,
    title: "응답 기록하기",
    description: "기도 응답을 기록하고 감사를 나누세요.",
  },
]

export function HowToUse() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.1 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <section id="how-to-use" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">사용 방법</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">기도모아는 간단한 4단계로 사용할 수 있습니다.</p>
        </div>

        <div ref={ref} className="relative">
          {/* 연결선 */}
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-sky-100 md:block lg:hidden" />

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative flex flex-col items-center text-center"
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
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
                  {step.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>

                {/* 단계 번호 */}
                <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
