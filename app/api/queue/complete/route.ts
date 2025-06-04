import { NextResponse } from "next/server"
import { completeCurrentService } from "@/lib/queue-service"

export async function POST() {
  try {
    await completeCurrentService()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao completar atendimento:", error)
    return NextResponse.json({ error: "Erro ao completar atendimento" }, { status: 500 })
  }
}
