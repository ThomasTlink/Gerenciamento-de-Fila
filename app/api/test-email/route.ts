import { NextResponse } from "next/server"
import { sendConfirmationEmail, sendNotificationEmail, sendAlmostYourTurnEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { type, email, name, ticketNumber, position } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email e nome são obrigatórios" }, { status: 400 })
    }

    if (type === "confirmation") {
      await sendConfirmationEmail(email, name, ticketNumber || 123, position || 1)
    } else if (type === "notification") {
      await sendNotificationEmail(email, name)
    } else if (type === "almostYourTurn") {
      await sendAlmostYourTurnEmail(email, name, position || 3)
    } else {
      return NextResponse.json({ error: "Tipo de email inválido" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar email de teste:", error)
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 })
  }
}
