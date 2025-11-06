"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Leaderboard } from "@/components/leaderboard"
import { Button } from "@/components/ui/button"

export default function LeaderboardPage() {
  const [isAuthed, setIsAuthed] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        setIsAuthed(false)
        router.push("/auth/login")
        return
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  if (!isAuthed) {
    return null
  }

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🏆 Ranking</h1>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Voltar ao Painel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Leaderboard />
      </main>
    </div>
  )
}
