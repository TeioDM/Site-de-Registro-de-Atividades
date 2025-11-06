"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ActivityStats {
  name: string
  icon_emoji: string
  count: number
  totalAmount: number
  unit: string
}

export function ActivityStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ActivityStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: logs } = await supabase
          .from("activity_logs")
          .select(`
            amount,
            activities (name, icon_emoji, unit)
          `)
          .eq("user_id", userId)

        if (!logs) return

        // Group by activity
        const grouped: Record<string, ActivityStats> = {}
        logs.forEach((log) => {
          const actName = (log.activities as any).name
          if (!grouped[actName]) {
            grouped[actName] = {
              name: actName,
              icon_emoji: (log.activities as any).icon_emoji,
              count: 0,
              totalAmount: 0,
              unit: (log.activities as any).unit,
            }
          }
          grouped[actName].count += 1
          grouped[actName].totalAmount += log.amount
        })

        setStats(Object.values(grouped).sort((a, b) => b.count - a.count))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Comece a registrar atividades para ver a análise</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...stats.map((s) => s.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Atividades</CardTitle>
        <CardDescription>Distribuição de suas atividades</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-lg">{stat.icon_emoji}</span>
                <span className="font-medium">{stat.name}</span>
              </span>
              <span className="text-sm text-gray-600">
                {stat.totalAmount.toFixed(1)} {stat.unit}
              </span>
            </div>
            <Progress value={(stat.count / maxCount) * 100} />
            <p className="text-xs text-gray-500">{stat.count} vezes</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
