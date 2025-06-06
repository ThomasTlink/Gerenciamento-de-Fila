"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Queue } from "@/types/supabase"

interface QueueFormProps {
  onSuccess: (client: Queue & { ticketNumber: number }) => void
}

export default function QueueForm({ onSuccess }: QueueFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao entrar na fila")
      }

      toast({
        title: "Sucesso!",
        description: "Você entrou na fila com sucesso. Você receberá notificações por email e SMS.",
      })

      onSuccess(data.client)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao entrar na fila",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Entre na Fila</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Preencha seus dados para entrar na fila de atendimento
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Digite seu nome completo"
              value={formData.name}
              onChange={handleChange}
              required
              className="text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm sm:text-base">
              Telefone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handleChange}
              required
              className="text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="text-sm sm:text-base"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading} size="sm">
            {isLoading ? "Entrando na fila..." : "Entrar na Fila"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
