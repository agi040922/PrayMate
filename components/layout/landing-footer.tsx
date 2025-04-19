import Link from "next/link"
import { Facebook, Twitter, Instagram, Github } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* 로고 및 소개 */}
          <div>
            <h2 className="mb-4 text-xl font-bold">프레이니</h2>
            <p className="mb-4 text-gray-400">
              함께 기도하고 응답을 나누는 공간입니다. 기도제목을 모아 공동체와 함께 기도해보세요.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">빠른 링크</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#service-intro" className="text-gray-400 hover:text-white">
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link href="#how-to-use" className="text-gray-400 hover:text-white">
                  사용법
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-400 hover:text-white">
                  사용자 후기
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white">
                  로그인
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 정보 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">법적 정보</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">소셜 미디어</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
                <span className="sr-only">Github</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">© 2025 프레이니. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
