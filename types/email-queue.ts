export interface EmailJob {
  id: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  status: "pending" | "processing" | "completed" | "failed"
  attempts: number
  maxAttempts: number
  createdAt: Date
  processedAt?: Date
  error?: string
  priority: number
}

export interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  total: number
}

export interface BatchEmailRequest {
  emails: Array<{
    to: string
    subject: string
    html?: string
    text?: string
    variables?: Record<string, any>
  }>
  template?: string
  priority?: number
}
