"use client"

import { useState, useEffect } from "react"
import QueueForm from "@/components/queue-form"
import ClientTicket from "@/components/client-ticket"
import type { Queue } from "@/types/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"

export default function HomePage() {
  const [client, setClient] = useState<(Queue & { ticketNumber: number }) | null>(null)

  const handleSuccess = (newClient: Queue & { ticketNumber: number }) => {
    setClient(newClient)
    localStorage.setItem("queueClient", JSON.stringify(newClient))
  }

  const handleAbandon = () => {
    setClient(null)
    localStorage.removeItem("queueClient")
  }

  const handleReenter = () => {
    setClient(null)
    localStorage.removeItem("queueClient")
  }

  // Verificar se há um cliente salvo no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedClient = localStorage.getItem("queueClient")
      if (savedClient) {
        try {
          const parsedClient = JSON.parse(savedClient)
          setClient(parsedClient)
        } catch (error) {
          console.error("Erro ao carregar cliente do localStorage:", error)
          localStorage.removeItem("queueClient")
        }
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-3 sm:py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Sistema de Filas</h1>
          </Link>
          <Link href="/admin" passHref>
            <Button variant="ghost" size="sm">
              <ShieldCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Área Admin</span>
              <span className="sm:hidden">Admin</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          {client ? (
            <ClientTicket client={client} onAbandon={handleAbandon} onReenter={handleReenter} />
          ) : (
            <QueueForm onSuccess={handleSuccess} />
          )}
        </div>
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Sistema de Gerenciamento de Filas
          </p>
        </div>
      </footer>
    </div>
  )
}
