import { NextResponse } from "next/server"
import { callNextClient } from "@/lib/queue-service"

export async function POST() {
  try {
    const client = await callNextClient()

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    console.error("Erro ao chamar próximo cliente:", error)
    return NextResponse.json({ error: "Erro ao chamar próximo cliente" }, { status: 500 })
  }
}
