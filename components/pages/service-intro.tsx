"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

export function ServiceIntro() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <section id="service-intro" className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-16 md:flex-row">
          {/* 이미지 */}
          <motion.div
            ref={ref}
            className="w-full md:w-1/2"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
            }}
          >
            <div className="overflow-hidden rounded-lg shadow-xl">
              <img
                src="\images\service-intro.png"
                alt="프레이니 서비스 소개"
                className="h-auto w-full object-cover"
              />
            </div>
          </motion.div>

          {/* 텍스트 */}
          <motion.div
            className="w-full md:w-1/2"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2 } },
            }}
          >
            <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
              공동체가 기도제목을 손쉽게 모으고,
              <br />
              하나님의 응답을 함께 경험하세요
            </h2>
            <p className="mb-6 text-lg text-gray-600">
              프레이니는 단체가 온라인 방을 만들어 구성원이 각자의 기도제목을 간편히 등록하고 실시간으로 확인, 관리할 수
              있도록 지원하는 웹 기반 서비스입니다.
            </p>
            <p className="text-lg text-gray-600">
              기존 카카오톡을 통한 비효율적 방식을 개선하여 효율성과 편의성을 높이고, 기도제목을 체계적으로 관리하며
              응답을 기록하고 공유할 수 있습니다.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
