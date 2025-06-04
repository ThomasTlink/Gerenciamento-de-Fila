"use client"

import { useState, useEffect } from "react"
import type { EmailJob, QueueStats } from "@/types/email-queue"
import { emailQueue } from "@/lib/email-queue"

export function useEmailQueue() {
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0,
  })
  const [jobs, setJobs] = useState<EmailJob[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = async () => {
    try {
      const response = await fetch("/api/email-queue")
      const data = await response.json()
      setStats(data.stats)
      setJobs(data.jobs)
    } catch (error) {
      console.error("Erro ao carregar dados da fila:", error)
    }
  }

  const sendBatchEmails = async (
    emails: Array<{
      to: string
      subject: string
      html?: string
      text?: string
    }>,
  ) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/email-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      })

      const result = await response.json()
      await refreshData()
      return result
    } catch (error) {
      console.error("Erro ao enviar e-mails em lote:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearCompleted = async () => {
    try {
      await fetch("/api/email-queue", { method: "DELETE" })
      await refreshData()
    } catch (error) {
      console.error("Erro ao limpar fila:", error)
    }
  }

  const startProcessing = () => {
    emailQueue.startProcessing()
  }

  const stopProcessing = () => {
    emailQueue.stopProcessing()
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 2000) // Atualiza a cada 2 segundos

    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    jobs,
    isLoading,
    sendBatchEmails,
    clearCompleted,
    startProcessing,
    stopProcessing,
    refreshData,
  }
}
