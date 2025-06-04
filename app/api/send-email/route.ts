import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, from } = await request.json()

    // Validação básica
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: "Campos obrigatórios: to, subject, e (html ou text)" }, { status: 400 })
    }

    const data = await resend.emails.send({
      from: from || "onboarding@resend.dev", // Use seu domínio verificado
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
