"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download } from "lucide-react"

interface ReportPreviewProps {
  reportText: string
  onReportTextChange: (text: string) => void
}

export default function ReportPreview({ reportText, onReportTextChange }: ReportPreviewProps) {
  // 리포트 복사 함수
  const copyReport = () => {
    navigator.clipboard.writeText(reportText)
  }

  // 리포트 다운로드 함수
  const downloadReport = () => {
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `기도제목_리포트_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>리포트 미리보기</CardTitle>
        <CardDescription>생성된 리포트를 확인하고 다운로드하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={reportText}
          onChange={(e) => onReportTextChange(e.target.value)}
          className="min-h-[400px] font-mono text-sm"
          placeholder="기도제목을 선택하고 '리포트 생성' 버튼을 클릭하세요."
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* 리포트 복사 버튼 */}
        <Button variant="outline" onClick={copyReport} disabled={!reportText}>
          <Copy className="mr-2 h-4 w-4" />
          복사
        </Button>
        {/* 리포트 다운로드 버튼 */}
        <Button onClick={downloadReport} disabled={!reportText}>
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </Button>
      </CardFooter>
    </Card>
  )
} 