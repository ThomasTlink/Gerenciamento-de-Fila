"use client"

import { useState } from "react"

interface EmailData {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

interface UseSendEmailReturn {
  sendEmail: (emailData: EmailData) => Promise<boolean>
  isLoading: boolean
  error: string | null
  success: boolean
}

export function useSendEmail(): UseSendEmailReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const sendEmail = async (emailData: EmailData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar e-mail")
      }

      setSuccess(true)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { sendEmail, isLoading, error, success }
}
