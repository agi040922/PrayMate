"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Github, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export function LandingFooter() {
  const { toast } = useToast()
  
  const handleSocialClick = (e: React.MouseEvent) => {
    e.preventDefault()
    toast({
      title: "준비 중인 기능",
      description: "소셜 미디어 연동은 현재 개발 중입니다. 곧 제공될 예정입니다.",
    })
  }
  
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
                <Dialog>
                  <DialogTrigger className="text-gray-400 hover:text-white cursor-pointer">
                    이용약관
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>이용약관</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-sm text-left max-h-96 overflow-y-auto">
                      <h4 className="font-semibold mb-2">제 1 조 (목적)</h4>
                      <p className="mb-4">
                        이 약관은 프레이니 서비스(이하 '서비스')의 이용조건 및 절차에 관한 사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
                      </p>
                      
                      <h4 className="font-semibold mb-2">제 2 조 (용어의 정의)</h4>
                      <p className="mb-4">
                        이 약관에서 사용하는 용어의 정의는 다음과 같습니다.<br />
                        1. '사용자'란 본 서비스에 접속하여 서비스를 이용하는 자를 말합니다.<br />
                        2. '기도방'이란 사용자들이 기도제목을 공유하고 함께 기도할 수 있는 가상의 공간을 말합니다.
                      </p>
                      
                      <h4 className="font-semibold mb-2">제 3 조 (약관의 효력)</h4>
                      <p>
                        이 약관은 서비스를 이용하고자 하는 모든 사용자에게 적용됩니다.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger className="text-gray-400 hover:text-white cursor-pointer">
                    개인정보 처리방침
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>개인정보 처리방침</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-sm text-left max-h-96 overflow-y-auto">
                      <h4 className="font-semibold mb-2">1. 수집하는 개인정보 항목</h4>
                      <p className="mb-4">
                        회원가입, 서비스 이용 과정에서 아래와 같은 개인정보를 수집할 수 있습니다.<br />
                        - 필수항목: 이메일 주소, 비밀번호, 닉네임<br />
                        - 선택항목: 프로필 이미지
                      </p>
                      
                      <h4 className="font-semibold mb-2">2. 개인정보의 수집 및 이용목적</h4>
                      <p className="mb-4">
                        수집한 개인정보는 서비스 제공, 계정 관리, 기도방 참여 및 관리, 공지사항 전달 등을 위해 사용됩니다.
                      </p>
                      
                      <h4 className="font-semibold mb-2">3. 개인정보의 보유 및 이용기간</h4>
                      <p>
                        회원 탈퇴 시 개인정보는 즉시 파기됩니다. 다만, 관련 법령에 의해 보존해야 하는 정보는 법령이 정한 기간 동안 보관됩니다.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <a 
                  href="mailto:jkh040922@gmail.com?subject=프레이니%20서비스%20문의&body=프레이니%20서비스에%20관심을%20가져주셔서%20감사합니다.%0A%0A문의사항:%0A%0A" 
                  className="text-gray-400 hover:text-white flex items-center"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">소셜 미디어</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white" onClick={handleSocialClick}>
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" onClick={handleSocialClick}>
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" onClick={handleSocialClick}>
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" onClick={handleSocialClick}>
                <Github className="h-5 w-5" />
                <span className="sr-only">Github</span>
              </a>
            </div>
          </div>
        </div>

        {/* 개발자 정보 */}
        <div className="mt-8 border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 mb-2">© 2025 프레이니. All rights reserved.</p>
          <div className="text-gray-500 text-sm">
            <p>개발자: 정경훈 | 연락처: 010-5953-5318 | 이메일: jkh040922@gmail.com</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
