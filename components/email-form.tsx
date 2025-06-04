"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useSendEmail } from "@/hooks/use-send-email"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function EmailForm() {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
  })

  const { sendEmail, isLoading, error, success } = useSendEmail()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await sendEmail({
      to: formData.to,
      subject: formData.subject,
      html: `<p>${formData.message.replace(/\n/g, "<br>")}</p>`,
      text: formData.message,
    })

    if (success) {
      setFormData({ to: "", subject: "", message: "" })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enviar E-mail</CardTitle>
        <CardDescription>Preencha os campos abaixo para enviar um e-mail</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">Para</Label>
            <Input
              id="to"
              name="to"
              type="email"
              placeholder="destinatario@exemplo.com"
              value={formData.to}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Assunto do e-mail"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Digite sua mensagem aqui..."
              value={formData.message}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>E-mail enviado com sucesso!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Enviando..." : "Enviar E-mail"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
