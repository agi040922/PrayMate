"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { motion, useAnimation, useInView } from "framer-motion"

export function WhyPraynie() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  // 텍스트 애니메이션 변수
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  // 로고 애니메이션 변수
  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const pulseVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <section className="overflow-hidden bg-gradient-to-b from-[#FEF9F5] to-[#F8F5FF] py-20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className="flex flex-col items-center justify-between gap-12 lg:flex-row lg:items-center lg:gap-16"
        >
          {/* 로고 애니메이션 영역 */}
          <motion.div
            className="relative flex-1 text-center"
            initial="hidden"
            animate={controls}
            variants={logoVariants}
          >
            <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <Image
                src="/images/logo.png"
                alt="Praynie 로고"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 384px"
                priority
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                variants={pulseVariants}
                initial="hidden"
                animate={controls}
                style={{
                  background: "radial-gradient(circle, rgba(173, 216, 230, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
                }}
              />
            </div>
          </motion.div>

          {/* 텍스트 영역 */}
          <motion.div
            className="flex flex-1 flex-col"
            initial="hidden"
            animate={controls}
            variants={containerVariants}
          >
            <motion.h2
              className="mb-2 text-2xl font-semibold text-[#F5A9B8] md:text-3xl"
              variants={itemVariants}
            >
              "Praynie"라는 이름, 그냥 지은 거 아니에요.
            </motion.h2>

            <motion.div className="mb-6 text-xl font-bold text-[#A1CFE8]" variants={itemVariants}>
              Pray + -nie
            </motion.div>

            <motion.p className="mb-3 text-lg text-slate-700" variants={itemVariants}>
              기도를 뜻하는 'Pray'<br />
              친근한 이름의 느낌을 주는 '-nie'
            </motion.p>

            <motion.p className="mb-4 text-lg text-slate-700" variants={itemVariants}>
              우리는 단순한 앱이 아니라<br />
              기도를 함께 나누는 <span className="font-semibold">당신의 친구가 되고 싶었습니다.</span>
            </motion.p>

            <motion.p className="text-lg text-slate-700" variants={itemVariants}>
              그래서 이름도 따뜻하게 지었어요.<br />
              부드럽게, 인격적으로, 기억에 남게.
            </motion.p>

            <motion.p
              className="mt-4 text-xl font-medium"
              variants={itemVariants}
              style={{
                background: "linear-gradient(90deg, #F5A9B8 0%, #A1CFE8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              기도하는 존재, 기도하는 친구, 프레이니.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* 하단 곡선 그래픽 */}
      <div className="relative mt-16 h-24 w-full overflow-hidden">
        <svg
          className="absolute bottom-0 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,288L48,272C96,256,192,224,288,224C384,224,480,256,576,261.3C672,267,768,245,864,224C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  )
} 