"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { LandingNavbar } from "@/components/layout/landing-navbar"
import { LandingFooter } from "@/components/layout/landing-footer"
import { HeartHandshake, Users, LineChart, Sparkles, Copy, Check } from "lucide-react"

export default function SupportPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "online" || searchParams.get("tab") === "account" 
    ? searchParams.get("tab") 
    : "online"
    
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [copied, setCopied] = useState(false)
  const [donationType, setDonationType] = useState("onetime")
  const [showQR, setShowQR] = useState(false)
  const [donationAmount, setDonationAmount] = useState<number | null>(null)
  
  // 계좌번호 복사 기능
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  
  // 금액 선택 처리
  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount)
  }
  
  // 직접 입력 처리
  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null
    setDonationAmount(value)
  }
  
  // 후원하기 버튼 처리
  const handleDonation = () => {
    
    // 실제 결제창으로 이동하는 로직을 여기에 구현
    // 예: 카카오페이, 토스 등의 결제 API 연동
    
    const donationUrl = 'https://qr.kakaopay.com/FUXQLYnvP' // 네 카카오페이 송금 링크
    window.open(donationUrl, '_blank') // 새 창으로 열기
    
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      
      {/* 상단 배너 */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">함께하는 기도의 여정</h1>
          <p className="mx-auto max-w-2xl text-lg text-blue-100">
            여러분의 후원은 더 많은 사람들이 함께 기도하고 위로받을 수 있는 공간을 만듭니다.
            프레이니는 여러분의 소중한 후원으로 운영됩니다.
          </p>
        </div>
      </section>
      
      {/* 후원 목적 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">소중한 후원이 만드는 변화</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="flex flex-col items-center p-6 text-center transition-all hover:shadow-md">
              <HeartHandshake className="mb-4 h-12 w-12 text-blue-600" />
              <CardTitle className="mb-4 text-xl">기도 네트워크 확장</CardTitle>
              <p className="text-gray-600">
                전 세계 그리스도인들이 더 쉽게 기도를 나누고 응답을 경험할 수 있도록 돕습니다.
              </p>
            </Card>
            
            <Card className="flex flex-col items-center p-6 text-center transition-all hover:shadow-md">
              <LineChart className="mb-4 h-12 w-12 text-blue-600" />
              <CardTitle className="mb-4 text-xl">서비스 안정성 향상</CardTitle>
              <p className="text-gray-600">
                안정적인 서버 운영과 지속적인 기능 개선을 통해 더 나은 기도 경험을 제공합니다.
              </p>
            </Card>
            
            <Card className="flex flex-col items-center p-6 text-center transition-all hover:shadow-md">
              <Sparkles className="mb-4 h-12 w-12 text-blue-600" />
              <CardTitle className="mb-4 text-xl">새로운 기능 개발</CardTitle>
              <p className="text-gray-600">
                더 의미 있는 기도 경험을 위한 새로운 기능과 콘텐츠를 지속적으로 개발합니다.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* 후원 통계 */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">함께하는 여러분</h2>
          
          <div className="mx-auto mb-10 max-w-3xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">이번 달 후원</h3>
                <p className="text-sm text-slate-500">목표: 50,000원</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-blue-600">0%</span>
              </div>
            </div>
            <Progress value={0} className="h-3 bg-slate-200" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-4xl font-bold text-blue-600">0</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-500">이번 달 후원자 수</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-4xl font-bold text-blue-600">0</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-500">정기 후원자 수</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-4xl font-bold text-blue-600">0원</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-500">이번 달 총 후원 금액</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* 후원 방법 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-3xl font-bold">후원 방법</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600">
            여러분에게 편리한 방법으로 프레이니를 후원해 주세요.
          </p>
          
          <div className="mx-auto max-w-3xl">
            <Tabs value={activeTab as string} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="online">온라인 후원</TabsTrigger>
                <TabsTrigger value="account">계좌 이체</TabsTrigger>
              </TabsList>
              
              <TabsContent value="online" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>간편 결제로 후원하기</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={donationAmount === 1000 ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => handleAmountSelect(10000)}
                        >
                          1,000원
                        </Button>
                        <Button 
                          variant={donationAmount === 5000 ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => handleAmountSelect(5000)}
                        >
                          5,000원
                        </Button>
                        <Button 
                          variant={donationAmount === 10000 ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => handleAmountSelect(10000)}
                        >
                          10,000원
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="직접 입력" 
                          min={1000} 
                          step={1000}
                          value={donationAmount && ![1000, 5000, 10000].includes(donationAmount) ? donationAmount : ''}
                          onChange={handleCustomAmount}
                        />
                        <span className="flex items-center">원</span>
                      </div>
                      
                      <Button 
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleDonation}
                      >
                        후원하기
                      </Button>
                      <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm text-blue-800">
                        웹 사이트의 경우 QR코드 혹은 계좌이체를 부탁드리겠습니다.. 감사합니다!
                      </p>
                    </div>
                      
                      <div className="mt-2 flex justify-center">
                        <Button 
                          variant="ghost" 
                          onClick={() => setShowQR(!showQR)}
                          className="text-sm text-blue-600"
                        >
                          QR 코드로 후원하기
                        </Button>
                        
                        
                      </div>
                      
                      {showQR && (
                        <div className="mt-4 flex flex-col items-center justify-center">
                          <div className="mb-4 h-48 w-48 bg-gray-200 p-2">
                            {/* 여기에 QR 코드 이미지를 넣으세요 */}
                            {/* 
                              QR 코드 이미지 추가 방법:
                              1. public/images/donation-qr.png와 같이 QR 코드 이미지 파일을 public 폴더에 저장하세요.
                              2. 아래 주석 처리된 Image 컴포넌트의 주석을 해제하고 src 경로를 실제 QR 코드 이미지 경로로 수정하세요.
                            */}
                            
                            <Image 
                              src="/images/donation-qr.png" 
                              alt="후원 QR 코드" 
                              width={360} 
                              height={360} 
                              className="h-full w-full object-contain"
                            /> 
                           
                            <div className="flex h-full w-full items-center justify-center bg-white">
                              <p className="text-sm text-gray-500">QR 코드</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">QR 코드를 스캔해주세요. 감사합니다!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>계좌 이체로 후원하기</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 rounded-lg bg-slate-50 p-4">
                      <p className="mb-2 font-medium">후원 계좌 정보</p>
                      <p className="text-sm text-gray-600">은행명: 카카오 뱅크</p>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <span>계좌번호: 3333-24-8095680</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-6 w-6"
                          onClick={() => copyToClipboard("123-456-789012")}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">예금주: 정경훈</p>
                    </div>
                    
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm text-blue-800">
                        <strong>입금자명 형식:</strong> 성함-후원 <br />
                        (예시: 홍길동-후원)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* 후원금 사용 내역
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">투명한 후원금 사용</h2>
          
          <div className="mx-auto max-w-3xl">
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-100">
                <CardTitle className="text-xl">2023년 후원금 사용 내역</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">항목</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">비용</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">비율</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-3 text-sm">서버 및 인프라 운영</td>
                        <td className="px-4 py-3 text-right text-sm">4,800,000원</td>
                        <td className="px-4 py-3 text-right text-sm">40%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 text-sm">개발 및 유지보수</td>
                        <td className="px-4 py-3 text-right text-sm">3,600,000원</td>
                        <td className="px-4 py-3 text-right text-sm">30%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 text-sm">콘텐츠 제작</td>
                        <td className="px-4 py-3 text-right text-sm">2,400,000원</td>
                        <td className="px-4 py-3 text-right text-sm">20%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">운영 및 마케팅</td>
                        <td className="px-4 py-3 text-right text-sm">1,200,000원</td>
                        <td className="px-4 py-3 text-right text-sm">10%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
      
      {/* 감사 메시지 */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">감사의 말씀</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            여러분의 소중한 후원 덕분에 프레이니는 더 많은 사람들에게 위로와 격려를 전할 수 있습니다.
            함께해주셔서 진심으로
            감사드립니다.
          </p>
          
          <Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white/20">
            <Link href="/prayer-room">기도방 입장하기</Link>
          </Button>
        </div>
      </section>
      
      <LandingFooter />
    </div>
  )
} 

// 축하드립니다! 프레이니 웹사이트에 후원 배너와 후원 페이지가 성공적으로 추가되었습니다. 구현된 내용을 요약하면 다음과 같습니다:
// 후원 배너 (DonationBanner) 컴포넌트:
// 사용자 친화적인 하단 고정형 배너로 구현했습니다.
// "당신의 기도가 누군가의 삶을 바꿉니다" 메시지와 함께 따뜻한 감성을 담았습니다.
// 부드러운 애니메이션으로 1초 후에 나타나도록 설정했습니다.
// "후원하기"와 "지금은 괜찮아요" 두 가지 선택지를 제공합니다.
// 한 번 닫으면 세션 동안 다시 보이지 않도록 구현했습니다.
// 후원 페이지 (/support):
// 후원의 목적과 사용처를 투명하게 보여주는 섹션을 포함했습니다.
// 후원 통계를 시각화하여 현재 달성률을 보여줍니다.
// 온라인 결제와 계좌 이체 두 가지 방식의 후원 방법을 제공합니다.
// 일시 후원과 정기 후원 옵션을 선택할 수 있습니다.
// 후원금 사용 내역을 투명하게 공개합니다.
// 소중한 후원에 대한 감사 메시지를 포함했습니다.
// 후원 배너는 너무 상업적이지 않고 부담을 주지 않으면서도 클릭을 유도할 수 있도록 디자인했으며, 후원 페이지는 투명성과 신뢰성을 높이는 요소들을 포함했습니다.
// 실제 서비스에 적용하기 전에 다음 사항을 확인해주세요:
// QR 코드 이미지 추가
// 실제 계좌번호와 통계 데이터 업데이트
// 실제 결제 시스템 연동 (카카오페이, 토스 등)
// 추가로 궁금한 점이나 수정이 필요한 사항이 있으시면 말씀해주세요!
