"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ActivityRegisterForm } from "@/components/activity-register-form"
import { RecentActivities } from "@/components/recent-activities"
import { Leaderboard } from "@/components/leaderboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserProfile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [totalPoints, setTotalPoints] = useState(0)
  const [activityCount, setActivityCount] = useState(0)
  const [rank, setRank] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) {
        router.push("/auth/login")
        return
      }

      // Fetch user profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", authData.user.id).single()

      if (profileData) {
        setUser(profileData)
      }

      // Fetch user stats
      const { data: statsData } = await supabase
        .from("activity_logs")
        .select("points_earned")
        .eq("user_id", authData.user.id)

      if (statsData) {
        const total = statsData.reduce((sum, log) => sum + log.points_earned, 0)
        setTotalPoints(total)
        setActivityCount(statsData.length)
      }

      // Isso garante que todos os usuários sejam comparados corretamente
      const { data: leaderboardData } = await supabase
        .from("leaderboard")
        .select("id")
        .order("total_points", { ascending: false })

      if (leaderboardData) {
        const userRank = leaderboardData.findIndex((u) => u.id === authData.user.id) + 1
        console.log("[v0] User rank calculated:", userRank)
        setRank(userRank)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [refreshTrigger])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleActivitySuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🏆 Rastreador de Atividades</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/profile")}>
                Perfil
              </Button>
              <Button variant="outline" onClick={() => router.push("/leaderboard")}>
                Ranking
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Pontos Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPoints}</div>
              <p className="mt-2 text-xs text-gray-500">Continue subindo!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activityCount}</div>
              <p className="mt-2 text-xs text-gray-500">Atividades registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Seu Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">#{rank}</div>
              <p className="mt-2 text-xs text-gray-500">Posição atual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Bem-vindo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="truncate text-sm font-semibold">{user?.full_name || user?.username}</div>
              <p className="mt-2 text-xs text-gray-500">Pronto para competir?</p>
            </CardContent>
          </Card>
        </div>

        {/* Forms and Activity List */}
        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <ActivityRegisterForm onSuccess={handleActivitySuccess} />
          </div>
          <div className="lg:col-span-3">
            <div className="grid gap-6">
              <RecentActivities refreshTrigger={refreshTrigger} />
              <Leaderboard refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
