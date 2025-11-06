"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface LeaderboardEntry {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  total_points: number
  activity_count: number
  rank?: number
}

export function Leaderboard({ refreshTrigger }: { refreshTrigger?: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const { data: userData } = await supabase.auth.getUser()
        setCurrentUserId(userData?.user?.id || null)

        // e garantir que todos os usuários são comparados juntos
        const { data: leaderboardData, error } = await supabase
          .from("leaderboard")
          .select("*")
          .order("total_points", { ascending: false })

        if (error) {
          console.error("[v0] Erro ao buscar leaderboard:", error)
          setEntries([])
          return
        }

        if (!leaderboardData) {
          setEntries([])
          return
        }

        const withRank = leaderboardData.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))

        console.log("[v0] Leaderboard atualizado com", withRank.length, "usuários")
        setEntries(withRank)
      } catch (error) {
        console.error("[v0] Erro ao carregar leaderboard:", error)
        setEntries([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [refreshTrigger])

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800"
    if (rank === 2) return "bg-gray-100 text-gray-800"
    if (rank === 3) return "bg-orange-100 text-orange-800"
    return "bg-blue-100 text-blue-800"
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking</CardTitle>
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
        <CardTitle>Ranking</CardTitle>
        <CardDescription>Classificações globais por pontos totais</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum participante ainda</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 rounded-lg p-3 ${
                  entry.id === currentUserId ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex w-8 items-center justify-center">
                  {getRankEmoji(entry.rank || 0) ? (
                    <span className="text-lg">{getRankEmoji(entry.rank || 0)}</span>
                  ) : (
                    <span className="font-semibold text-gray-600">#{entry.rank}</span>
                  )}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarFallback>{(entry.full_name || entry.username).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {entry.full_name || entry.username}
                    {entry.id === currentUserId && <span className="ml-2 text-xs text-blue-600">(Você)</span>}
                  </p>
                  <p className="text-sm text-gray-500">{entry.activity_count} atividades</p>
                </div>

                <Badge className={getRankBadgeColor(entry.rank || 0)}>{entry.total_points} pts</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
