"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { NotificationList } from "@/components/features/notifications/notification-list"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const router = useRouter()
  
  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <NotificationList onBackClick={handleBackClick} />
    </div>
  )
}
