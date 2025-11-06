import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Verifique seu Email</CardTitle>
            <CardDescription>Enviamos um link de confirmação para o seu endereço de email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Clique no link no email para verificar sua conta e começar a rastrear atividades.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Voltar para Entrar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
