"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ProfileData {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  total_points: number
  activity_count: number
  rank: number
}

export function ProfileCard({ userId, onEditClick }: { userId: string; onEditClick?: () => void }) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch profile data
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (!profileData) return

        // Fetch stats
        const { data: activityData } = await supabase
          .from("activity_logs")
          .select("points_earned")
          .eq("user_id", userId)

        const totalPoints = activityData?.reduce((sum, log) => sum + log.points_earned, 0) || 0

        // Fetch rank
        const { data: allProfiles } = await supabase.from("profiles").select("id")

        const { data: allStats } = await supabase.from("activity_logs").select("user_id, points_earned")

        const userPointsMap: Record<string, number> = {}
        allStats?.forEach((log) => {
          userPointsMap[log.user_id] = (userPointsMap[log.user_id] || 0) + log.points_earned
        })

        const sortedUsers = (allProfiles || []).sort((a, b) => (userPointsMap[b.id] || 0) - (userPointsMap[a.id] || 0))

        const rank = sortedUsers.findIndex((u) => u.id === userId) + 1

        setProfile({
          ...profileData,
          total_points: totalPoints,
          activity_count: activityData?.length || 0,
          rank,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Perfil não encontrado</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>{(profile.full_name || profile.username).charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile.full_name || profile.username}</h2>
            <p className="text-sm text-gray-600">@{profile.username}</p>
            {profile.bio && <p className="mt-2 text-sm text-gray-700">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{profile.total_points}</p>
            <p className="text-xs text-gray-600">Pontos</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{profile.activity_count}</p>
            <p className="text-xs text-gray-600">Atividades</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">#{profile.rank}</p>
            <p className="text-xs text-gray-600">Ranking</p>
          </div>
        </div>

        {profile.bio && (
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold text-gray-700">Bio</p>
            <p className="mt-1 text-sm text-gray-600">{profile.bio}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Membro desde {new Date(profile.created_at).toLocaleDateString("pt-BR")}
        </div>

        {onEditClick && (
          <Button onClick={onEditClick} className="w-full bg-transparent" variant="outline">
            Editar Perfil
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
