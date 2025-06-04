import { type NextRequest, NextResponse } from "next/server"
import { emailQueue } from "@/lib/email-queue"
import type { BatchEmailRequest } from "@/types/email-queue"

export async function POST(request: NextRequest) {
  try {
    const body: BatchEmailRequest = await request.json()

    const jobs = body.emails.map((email) => ({
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      from: "onboarding@resend.dev", // Use seu domínio
      maxAttempts: 3,
      priority: body.priority || 1,
    }))

    const jobIds = emailQueue.addBatchJobs(jobs)

    return NextResponse.json({
      success: true,
      jobIds,
      message: `${jobIds.length} e-mails adicionados à fila`,
    })
  } catch (error) {
    console.error("Erro ao adicionar à fila:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = emailQueue.getStats()
    const jobs = emailQueue.getAllJobs()

    return NextResponse.json({ stats, jobs })
  } catch (error) {
    console.error("Erro ao obter dados da fila:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    emailQueue.clearCompleted()
    return NextResponse.json({ success: true, message: "Jobs concluídos removidos" })
  } catch (error) {
    console.error("Erro ao limpar fila:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
