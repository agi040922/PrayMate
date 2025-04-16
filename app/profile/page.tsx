"use client"

import { ProfileProvider } from "@/lib/context/ProfileContext"
import { ProfileContent } from "@/components/features/profile/profile-content"

export default function ProfilePage() {
  return (
    <ProfileProvider>
      <ProfileContent />
    </ProfileProvider>
  )
}
