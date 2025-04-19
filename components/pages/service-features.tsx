"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { Clock, Shield, Smartphone, BookOpen, Brain } from "lucide-react"

const features = [
  {
    icon: <Clock className="h-10 w-10 text-sky-500" />,
    title: "실시간 공유",
    description: "기도제목을 실시간으로 공유하고 함께 기도할 수 있습니다.",
  },
  {
    icon: <Brain className="h-10 w-10 text-sky-500" />,
    title: "인공지능 제안",
    description: "기도를 입력하면 인공지능이 기도와 말씀을을 제안합니다.",
  },
  {
    icon: <Smartphone className="h-10 w-10 text-sky-500" />,
    title: "모바일 최적화",
    description: "언제 어디서나 모바일로 편리하게 기도제목을 확인하고 관리할 수 있습니다.",
  },
  {
    icon: <BookOpen className="h-10 w-10 text-sky-500" />,
    title: "말씀 중심",
    description: "성경 구절과 함께 기도제목을 나누고 말씀에 기반한 기도를 할 수 있습니다.",
  },
]

export function ServiceFeatures() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.1 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">특별한 기능</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
          프레이니는 기도제목 관리와 공유를 위한 다양한 기능을 제공합니다.
          </p>
        </div>

        <div ref={ref} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="rounded-lg bg-white p-6 shadow-lg transition-all hover:shadow-xl"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: index * 0.1 },
                },
              }}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
