import { NextResponse } from "next/server"
import { abandonQueue } from "@/lib/queue-service"

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 })
    }

    await abandonQueue(clientId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao desistir da fila:", error)
    return NextResponse.json({ error: "Erro ao desistir da fila" }, { status: 500 })
  }
}
