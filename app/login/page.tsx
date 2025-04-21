"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { signInWithEmail, signUp, signInWithOAuth } from "@/lib/supabase/users"
import { useAuth } from "@/lib/context/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { Provider } from "@supabase/supabase-js"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [isLoading, setIsLoading] = useState(false)
  
  // 로그인 폼 상태
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  
  // 회원가입 폼 상태
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerContact, setRegisterContact] = useState("")
  
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // 이미 로그인한 경우 기도방으로 리다이렉트
  useEffect(() => {
    if (user) {
      router.push("/prayer-room")
    }
  }, [user, router])
  
  // 이메일/비밀번호 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      await signInWithEmail(loginEmail, loginPassword)
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      })
      router.push("/prayer-room")
    } catch (error) {
      console.error(error)
      toast({
        title: "로그인 실패",
        description: "이메일 또는 비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // 회원가입 처리
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!registerEmail || !registerPassword || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "이메일, 비밀번호, 비밀번호 확인을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    if (!registerName) {
      toast({
        title: "입력 오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    if (registerPassword !== confirmPassword) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      await signUp(
        registerEmail, 
        registerPassword, 
        {
          name: registerName,
          contact: registerContact
        }
      )
      // 회원가입 성공 후 이메일 인증 안내 페이지로 리다이렉트
      router.push(`/email-confirmation?email=${encodeURIComponent(registerEmail)}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "회원가입 실패",
        description: "회원가입 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // 소셜 로그인 처리
  const handleSocialLogin = async (provider: Provider) => {
    try {
      setIsLoading(true)
      
      // 모바일 앱 내 웹뷰 감지
      const isInAppBrowser = 
        /KAKAOTALK/i.test(navigator.userAgent) || 
        /Line/i.test(navigator.userAgent) ||
        /NAVER/i.test(navigator.userAgent) ||
        /Instagram/i.test(navigator.userAgent) ||
        /FB_IAB/i.test(navigator.userAgent) ||
        /FB4A/i.test(navigator.userAgent) ||
        /FBAN/i.test(navigator.userAgent) ||
        /Twitter/i.test(navigator.userAgent);
      
      if (isInAppBrowser) {
        // 앱 내 브라우저일 경우 안내 모달 표시
        const confirmed = window.confirm(
          "외부 브라우저에서 열기를 권장합니다.\n\n외부 브라우저에서 열까요?"
        );
        
        if (confirmed) {
          // 현재 URL을 외부 브라우저로 열기
          const loginUrl = `${window.location.origin}/login`;
          
          // iOS
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = `googlechrome://navigate?url=${encodeURIComponent(loginUrl)}`;
            setTimeout(function() {
              window.location.href = `safari-https://praying.vercel.app/login`;
            }, 2000);
          } 
          // Android
          else {
            window.location.href = `intent://${window.location.host}/login#Intent;scheme=https;package=com.android.chrome;end`;
          }
          return;
        }
      }
      
      // 정상적인 경우 기존 로그인 처리 진행
      await signInWithOAuth(provider)
    } catch (error) {
      console.error(error)
      toast({
        title: "소셜 로그인 실패",
        description: "로그인 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  //로그인 화면 
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
        style={{ backgroundImage: "url('/placeholder.svg?height=1080&width=1920')" }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">프레이니</h1>
        </Link>

        <Card className="w-full bg-white/95 backdrop-blur">
          <Tabs
            defaultValue={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "register")}
            className="w-full"
          >
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="register">회원가입</TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* 로그인 탭 */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin}>
                <CardContent className="pt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="이메일 주소"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">비밀번호</Label>
                        <Link href="/forgot-password" className="text-xs text-sky-600 hover:underline">
                          비밀번호 찾기
                        </Link>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="비밀번호"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "로그인 중..." : "로그인"}
                    </Button>
                  </div>

                  <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">소셜 계정으로 로그인</span>
                    </div>
                  </div>

                  {/* 소셜 로그인 버튼 */}  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                        <path fill="none" d="M1 1h22v22H1z" />
                      </svg>
                      Google
                    </Button>
                    {/* <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin("kakao")}
                      disabled={isLoading}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" className="mr-2 h-4 w-4">
                        <g fill="none">
                          <path
                            fill="#FFEB00"
                            d="M9 1.5C4.86 1.5 1.5 4.129 1.5 7.393c0 2.085 1.479 3.89 3.615 4.984-.118.35-.759 2.25-.786 2.404-.036.193.071.19.15.138.062-.04 2.589-1.72 3.001-1.996.5.073 1.01.113 1.52.113 4.14 0 7.5-2.63 7.5-5.893S13.14 1.5 9 1.5Z"
                          />
                          <path
                            fill="#3C2929"
                            d="M5.25 7.875c0 .31-.224.563-.5.563-.276 0-.5-.252-.5-.563 0-.31.224-.562.5-.562.276 0 .5.252.5.563Zm4.5 0c0 .31-.224.563-.5.563-.276 0-.5-.252-.5-.563 0-.31.224-.562.5-.562.276 0 .5.252.5.563Zm4 0c0 .31-.224.563-.5.563-.276 0-.5-.252-.5-.563 0-.31.224-.562.5-.562.276 0 .5.252.5.563Z"
                          />
                        </g>
                      </svg>
                      Kakao
                    </Button> */}
                  </div>
                </CardContent>
              </form>
              <CardFooter className="flex flex-col space-y-4 pb-6">
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">계정이 없으신가요? </span>
                  <button onClick={() => setActiveTab("register")} className="text-sky-600 hover:underline">
                    회원가입
                  </button>
                </div>
              </CardFooter>
            </TabsContent>

            {/* 회원가입 탭 */} 
            <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegister}>
                <CardContent className="pt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="register-email">이메일</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="이메일 주소"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-name">이름 *</Label>
                      <Input 
                        id="register-name" 
                        placeholder="이름"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-contact">연락처</Label>
                      <Input 
                        id="register-contact" 
                        placeholder="연락처"
                        value={registerContact}
                        onChange={(e) => setRegisterContact(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-password">비밀번호</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="비밀번호"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">비밀번호 확인</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="비밀번호 확인"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "처리 중..." : "회원가입"}
                    </Button>
                  </div>

                  {/* <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">소셜 계정으로 가입</span>
                    </div>
                  </div> */}

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                        <path fill="none" d="M1 1h22v22H1z" />
                      </svg>
                      Google
                    </Button>
                    {/* <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin("kakao")}
                      disabled={isLoading}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" className="mr-2 h-4 w-4">
                        <g fill="none">
                          <path
                            fill="#FFEB00"
                            d="M9 1.5C4.86 1.5 1.5 4.129 1.5 7.393c0 2.085 1.479 3.89 3.615 4.984-.118.35-.759 2.25-.786 2.404-.036.193.071.19.15.138.062-.04 2.589-1.72 3.001-1.996.5.073 1.01.113 1.52.113 4.14 0 7.5-2.63 7.5-5.893S13.14 1.5 9 1.5Z"
                          />
                          <path
                            fill="#3C2929"
                            d="M5.25 7.875c0 .31-.224.563-.5.563-.276 0-.5-.252-.5-.563 0-.31.224-.562.5-.562.276 0 .5.252.5.563Zm4.5 0c0 .31-.224.563-.5.563-.276 0-.5-.252-.5-.563 0-.31.224-.562.5-.562.276 0 .5.252.5.563Zm4 0c0 .31-.224.563-.5.563-.276 0-.5-.252-.5-.563 0-.31.224-.562.5-.562.276 0 .5.252.5.563Z"
                          />
                        </g>
                      </svg>
                      Kakao
                    </Button> */}
                  </div>
                </CardContent>
              </form>
              <CardFooter className="flex flex-col space-y-4 pb-6">
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
                  <button onClick={() => setActiveTab("login")} className="text-sky-600 hover:underline">
                    로그인
                  </button>
                </div>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
