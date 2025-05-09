import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/utils/theme-provider"
import { AuthProvider } from "@/lib/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "프레이니 - 함께 기도하는 친구",
  description: "기도제목을 모아 함께 기도하고 응답을 나누는 공간입니다.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
            <Analytics />

          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
