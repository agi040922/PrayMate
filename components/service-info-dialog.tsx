"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InfoIcon } from "lucide-react"

export function ServiceInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-white/80 hover:text-white">
          <InfoIcon className="mr-2 h-4 w-4" />
          서비스 안내
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>기도모아 서비스 안내</DialogTitle>
          <DialogDescription>
            기도모아는 단체가 온라인 방을 만들어 구성원이 각자의 기도제목을 간편히 등록하고 실시간으로 확인, 관리할 수
            있도록 지원하는 웹 기반 서비스입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <h3 className="font-medium">서비스 이용 방법</h3>
            <ol className="ml-4 list-decimal text-sm text-muted-foreground">
              <li className="mb-2">계정을 생성하거나 로그인합니다.</li>
              <li className="mb-2">새로운 기도방을 만들거나 초대 코드를 통해 기존 방에 참여합니다.</li>
              <li className="mb-2">기도제목을 등록하고 다른 사람들의 기도제목을 확인합니다.</li>
              <li className="mb-2">"함께 기도" 버튼을 통해 응원과 공감을 표현할 수 있습니다.</li>
              <li>기도 응답을 기록하고 공유할 수 있습니다.</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
