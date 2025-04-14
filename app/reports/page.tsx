"use client"

import dynamic from "next/dynamic"

const ReportContainer = dynamic(() => import("@/components/features/reports/ReportContainer"), {
  ssr: false,
})

export default function ReportsPage() {
  return <ReportContainer />
}
