import { Card, CardContent } from "@/components/ui/card"

export function SummaryCards() {
  const summaryData = [
    { title: "기도제목 총 수", value: "128", icon: "🙏" },
    { title: "이번 주 등록", value: "23", icon: "📝" },
    { title: "응답된 기도", value: "42 (33%)", icon: "✅" },
    { title: "즐겨찾기", value: "15", icon: "⭐" },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
              <div className="text-2xl">{item.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
