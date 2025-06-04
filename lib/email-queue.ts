import type { EmailJob, QueueStats } from "@/types/email-queue"

class EmailQueueManager {
  private storageKey = "email_queue"
  private processingInterval: NodeJS.Timeout | null = null
  private isProcessing = false

  // Simula um banco de dados usando localStorage (em produção, use um banco real)
  private getQueue(): EmailJob[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : []
  }

  private saveQueue(queue: EmailJob[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.storageKey, JSON.stringify(queue))
  }

  // Adiciona um job à fila
  addJob(jobData: Omit<EmailJob, "id" | "status" | "attempts" | "createdAt">): string {
    const job: EmailJob = {
      ...jobData,
      id: crypto.randomUUID(),
      status: "pending",
      attempts: 0,
      createdAt: new Date(),
      maxAttempts: jobData.maxAttempts || 3,
      priority: jobData.priority || 1,
    }

    const queue = this.getQueue()
    queue.push(job)

    // Ordena por prioridade (maior prioridade primeiro)
    queue.sort((a, b) => b.priority - a.priority)

    this.saveQueue(queue)
    return job.id
  }

  // Adiciona múltiplos jobs (envio em massa)
  addBatchJobs(emails: Array<Omit<EmailJob, "id" | "status" | "attempts" | "createdAt">>): string[] {
    const jobIds: string[] = []

    emails.forEach((emailData) => {
      const jobId = this.addJob(emailData)
      jobIds.push(jobId)
    })

    return jobIds
  }

  // Obtém próximo job para processar
  getNextJob(): EmailJob | null {
    const queue = this.getQueue()
    const pendingJob = queue.find((job) => job.status === "pending")

    if (pendingJob) {
      pendingJob.status = "processing"
      this.saveQueue(queue)
    }

    return pendingJob || null
  }

  // Marca job como concluído
  completeJob(jobId: string): void {
    const queue = this.getQueue()
    const job = queue.find((j) => j.id === jobId)

    if (job) {
      job.status = "completed"
      job.processedAt = new Date()
      this.saveQueue(queue)
    }
  }

  // Marca job como falhou
  failJob(jobId: string, error: string): void {
    const queue = this.getQueue()
    const job = queue.find((j) => j.id === jobId)

    if (job) {
      job.attempts += 1
      job.error = error

      if (job.attempts >= job.maxAttempts) {
        job.status = "failed"
      } else {
        job.status = "pending" // Recoloca na fila para retry
      }

      job.processedAt = new Date()
      this.saveQueue(queue)
    }
  }

  // Obtém estatísticas da fila
  getStats(): QueueStats {
    const queue = this.getQueue()

    return {
      pending: queue.filter((j) => j.status === "pending").length,
      processing: queue.filter((j) => j.status === "processing").length,
      completed: queue.filter((j) => j.status === "completed").length,
      failed: queue.filter((j) => j.status === "failed").length,
      total: queue.length,
    }
  }

  // Obtém todos os jobs
  getAllJobs(): EmailJob[] {
    return this.getQueue()
  }

  // Limpa jobs concluídos
  clearCompleted(): void {
    const queue = this.getQueue()
    const filtered = queue.filter((job) => job.status !== "completed")
    this.saveQueue(filtered)
  }

  // Inicia o processamento automático
  startProcessing(intervalMs = 5000): void {
    if (this.processingInterval) return

    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, intervalMs)
  }

  // Para o processamento automático
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  // Processa a fila
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      const job = this.getNextJob()
      if (!job) return

      // Simula rate limiting (Resend permite ~10 emails/segundo)
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Envia o e-mail
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: job.to,
          subject: job.subject,
          html: job.html,
          text: job.text,
          from: job.from,
        }),
      })

      if (response.ok) {
        this.completeJob(job.id)
      } else {
        const error = await response.text()
        this.failJob(job.id, error)
      }
    } catch (error) {
      console.error("Erro no processamento da fila:", error)
    } finally {
      this.isProcessing = false
    }
  }
}

export const emailQueue = new EmailQueueManager()
