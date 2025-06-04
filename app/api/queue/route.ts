import { NextResponse } from "next/server"
import { addToQueue, getQueueClients, getCurrentTicket } from "@/lib/queue-service"

export async function POST(request: Request) {
  try {
    const { name, phone, email } = await request.json()

    if (!name || !phone || !email) {
      return NextResponse.json({ error: "Nome, telefone e email são obrigatórios" }, { status: 400 })
    }

    const client = await addToQueue(name, phone, email)

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error("Erro ao adicionar à fila:", error)
    return NextResponse.json({ error: "Erro ao adicionar à fila" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [clients, currentTicket] = await Promise.all([getQueueClients(), getCurrentTicket()])

    return NextResponse.json({
      clients,
      currentTicket,
    })
  } catch (error) {
    console.error("Erro ao obter dados da fila:", error)
    return NextResponse.json({ error: "Erro ao obter dados da fila" }, { status: 500 })
  }
}
