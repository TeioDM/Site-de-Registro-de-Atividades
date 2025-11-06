"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ActivityLog {
  id: string
  amount: number
  points_earned: number
  notes: string | null
  created_at: string
  activities: {
    name: string
    unit: string
    icon_emoji: string
  }
}

export function RecentActivities({ refreshTrigger }: { refreshTrigger?: number }) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)
      try {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) return

        const { data, error } = await supabase
          .from("activity_logs")
          .select(`
            id,
            amount,
            points_earned,
            notes,
            created_at,
            activities (name, unit, icon_emoji)
          `)
          .eq("user_id", user.user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) {
          console.error("Error fetching activities:", error)
          return
        }

        setActivities(data || [])
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [refreshTrigger])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Suas atividades registradas recentemente</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda. Comece a rastrear hoje!</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{activity.activities.icon_emoji}</span>
                      <div>
                        <p className="font-semibold">{activity.activities.name}</p>
                        <p className="text-sm text-gray-500">
                          {activity.amount} {activity.activities.unit}
                        </p>
                      </div>
                    </div>
                    {activity.notes && <p className="mt-1 text-sm text-gray-600">{activity.notes}</p>}
                  </div>
                  <Badge className="bg-green-100 text-green-800">+{activity.points_earned}</Badge>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(activity.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
