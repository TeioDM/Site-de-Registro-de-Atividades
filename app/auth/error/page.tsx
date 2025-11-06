import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ErrorPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Ops! Algo deu errado</CardTitle>
            <CardDescription>Houve um problema com sua solicitação de autenticação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Isso pode ter ocorrido porque o link expirou ou já foi usado. Tente entrar novamente.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Voltar para Entrar</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/sign-up">Criar Nova Conta</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
