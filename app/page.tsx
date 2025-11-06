import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4 md:p-6">
      <div className="text-center space-y-4">
        <div className="text-6xl">🏆</div>
        <h1 className="text-4xl font-bold md:text-5xl">Rastreador de Atividades</h1>
        <p className="text-lg text-gray-600 md:text-xl">
          Rastreie suas atividades esportivas e de fitness, compita com amigos e suba no ranking
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/auth/sign-up">Comece Agora</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/auth/login">Entre</Link>
        </Button>
      </div>
    </div>
  )
}
