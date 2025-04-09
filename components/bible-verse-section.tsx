"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

export function BibleVerseSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <section className="relative py-20">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/placeholder.svg?height=600&width=1200&text=성경+배경')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 1.5 } },
          }}
          className="mx-auto max-w-3xl"
        >
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.5 } },
            }}
            className="mb-6 text-xl font-medium italic text-white md:text-2xl"
          >
            "너희 중에 두 사람이 땅에서 합심하여 무엇이든지 구하면 하늘에 계신 내 아버지께서 그들을 위하여 이루게
            하시리라."
          </motion.p>
          <motion.p
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 1, delay: 1.5 } },
            }}
            className="text-lg text-white/80"
          >
            마태복음 18:19
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 1, delay: 2 } },
            }}
            className="mt-12"
          >
            <p className="text-xl font-medium text-white md:text-2xl">쉬지 말고 기도하라</p>
            <p className="mt-2 text-lg text-white/80">데살로니가전서 5:17</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
