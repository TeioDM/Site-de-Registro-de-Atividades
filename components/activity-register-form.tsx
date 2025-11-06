"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Activity {
  id: string
  name: string
  points_per_unit: number
  unit: string
  icon_emoji: string
}

export function ActivityRegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedActivity, setSelectedActivity] = useState("")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase.from("activities").select("*")
      if (error) {
        console.error("Error fetching activities:", error)
        return
      }
      setActivities(data || [])
    }

    fetchActivities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedActivity || !amount) {
      toast({ description: "Por favor, preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const activity = activities.find((a) => a.id === selectedActivity)
      if (!activity) throw new Error("Activity not found")

      const pointsEarned = Math.floor(Number.parseFloat(amount) * activity.points_per_unit)

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("User not authenticated")

      if (Number.parseFloat(amount) <= 0) {
        throw new Error("A quantidade deve ser maior que 0")
      }

      const { error } = await supabase.from("activity_logs").insert({
        user_id: user.user.id,
        activity_id: selectedActivity,
        amount: Number.parseFloat(amount),
        points_earned: pointsEarned,
        notes: notes || null,
      })

      if (error) throw error

      toast({ description: `Atividade registrada! Você ganhou ${pointsEarned} pontos` })
      setAmount("")
      setNotes("")
      setSelectedActivity("")
      onSuccess?.()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao registrar atividade"
      toast({ description: message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Atividade</CardTitle>
        <CardDescription>Registre suas atividades esportivas e de fitness</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity">Tipo de Atividade</Label>
            <Select value={selectedActivity} onValueChange={setSelectedActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma atividade" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.icon_emoji} {activity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Quantidade ({activities.find((a) => a.id === selectedActivity)?.unit || "unidades"})
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.1"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Como foi? Algum detalhe adicional?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {selectedActivity && amount && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm">
              <p className="font-semibold">
                Pontos ganhos:{" "}
                {Math.floor(
                  Number.parseFloat(amount) * (activities.find((a) => a.id === selectedActivity)?.points_per_unit || 0),
                )}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar Atividade"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
