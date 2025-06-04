"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEmailQueue } from "@/hooks/use-email-queue"
import { Upload, Send } from "lucide-react"

export default function BatchEmailForm() {
  const [emailList, setEmailList] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [result, setResult] = useState<string | null>(null)

  const { sendBatchEmails, isLoading } = useEmailQueue()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Parse da lista de e-mails
    const emails = emailList
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line.includes("@"))
      .map((email) => ({
        to: email,
        subject,
        html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
        text: message,
      }))

    if (emails.length === 0) {
      setResult("Nenhum e-mail válido encontrado")
      return
    }

    try {
      const response = await sendBatchEmails(emails)
      setResult(`✅ ${emails.length} e-mails adicionados à fila com sucesso!`)

      // Limpa o formulário
      setEmailList("")
      setSubject("")
      setMessage("")
    } catch (error) {
      setResult("❌ Erro ao adicionar e-mails à fila")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setEmailList(content)
    }
    reader.readAsText(file)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Envio em Massa
        </CardTitle>
        <CardDescription>Envie e-mails para múltiplos destinatários usando o sistema de filas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailList">Lista de E-mails</Label>
            <Textarea
              id="emailList"
              placeholder="Digite um e-mail por linha:&#10;usuario1@exemplo.com&#10;usuario2@exemplo.com&#10;usuario3@exemplo.com"
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              rows={6}
              required
            />
            <div className="flex items-center gap-2">
              <Input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Carregar arquivo
                  </span>
                </Button>
              </Label>
              <span className="text-sm text-gray-500">
                {emailList.split("\n").filter((line) => line.trim() && line.includes("@")).length} e-mails válidos
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              placeholder="Assunto do e-mail"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>

          {result && (
            <Alert>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adicionando à fila..." : "Adicionar à Fila de Envio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
