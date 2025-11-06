"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

export function ActivityHistory({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const supabase = createClient()

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)
      try {
        const from = (page - 1) * itemsPerPage
        const to = from + itemsPerPage - 1

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
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(from, to)

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
  }, [userId, page])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atividades</CardTitle>
        <CardDescription>Registro completo de atividades</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda</p>
        ) : (
          <>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{activity.activities.icon_emoji}</span>
                        <div>
                          <p className="font-semibold">{activity.activities.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(activity.created_at).toLocaleTimeString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {activity.notes && <p className="mt-1 text-sm text-gray-600 ml-8">{activity.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {activity.amount} {activity.activities.unit}
                      </p>
                      <Badge className="mt-1 bg-green-100 text-green-800">+{activity.points_earned}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                Anterior
              </Button>
              <span className="text-sm text-gray-600">Página {page}</span>
              <Button variant="outline" onClick={() => setPage(page + 1)} disabled={activities.length < itemsPerPage}>
                Próxima
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
