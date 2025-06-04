"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send, Clock, Bell } from "lucide-react"

export default function EmailTest() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const testConfirmationEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um email para teste",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "confirmation",
          email,
          name: "Usuário Teste",
          ticketNumber: 123,
          position: 5,
        }),
      })

      if (response.ok) {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada",
        })
      } else {
        throw new Error("Erro ao enviar email")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o email de teste",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAlmostYourTurnEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um email para teste",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "almostYourTurn",
          email,
          name: "Usuário Teste",
          position: 3,
        }),
      })

      if (response.ok) {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada",
        })
      } else {
        throw new Error("Erro ao enviar email")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o email de teste",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testNotificationEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um email para teste",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notification",
          email,
          name: "Usuário Teste",
        }),
      })

      if (response.ok) {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada",
        })
      } else {
        throw new Error("Erro ao enviar email")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o email de teste",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Teste de Email
        </CardTitle>
        <CardDescription>Teste o sistema de envio de emails</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="Digite seu email para teste"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-2">
          <Button onClick={testConfirmationEmail} disabled={isLoading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Testar Email de Boas-vindas
          </Button>

          <Button onClick={testAlmostYourTurnEmail} disabled={isLoading} variant="secondary" className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            Testar Email "Faltam 3 pessoas"
          </Button>

          <Button onClick={testNotificationEmail} disabled={isLoading} variant="outline" className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Testar Email "É a sua vez"
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
