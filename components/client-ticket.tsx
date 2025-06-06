"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Queue } from "@/types/supabase"
import { AlertCircle, Clock, Users, RotateCcw } from "lucide-react"

interface ClientTicketProps {
  client: Queue & { ticketNumber: number }
  onAbandon: () => void
  onReenter: () => void
}

export default function ClientTicket({ client, onAbandon, onReenter }: ClientTicketProps) {
  const [currentTicket, setCurrentTicket] = useState<Queue | null>(null)
  const [queueClients, setQueueClients] = useState<Queue[]>([])
  const [position, setPosition] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        const response = await fetch("/api/queue")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.currentTicket) {
          setCurrentTicket(data.currentTicket)
        }

        if (data.clients) {
          setQueueClients(data.clients)

          const clientInQueue = data.clients.find((c: Queue) => c.id === client.id)
          if (clientInQueue) {
            setPosition(clientInQueue.position)
          } else if (data.currentTicket?.id === client.id) {
            setPosition(-1)
          } else {
            setPosition(null)
          }
        }
      } catch (error) {
        console.error("Erro ao obter dados da fila:", error)
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível atualizar os dados da fila.",
        })
      }
    }

    fetchQueueData()
    const interval = setInterval(fetchQueueData, 5000)
    return () => clearInterval(interval)
  }, [client.id, toast])

  // Configurar notificações do navegador
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission()
    }
  }, [])

  // Verificar se é a vez do cliente
  useEffect(() => {
    if (currentTicket?.id === client.id) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("É a sua vez!", {
          body: "Você tem 2 minutos para comparecer ao atendimento ou perderá sua vez na fila.",
          icon: "/favicon.ico",
        })
      }

      const audio = new Audio("/notification.mp3")
      audio.play().catch((e) => console.error("Erro ao tocar áudio:", e))
    }
  }, [currentTicket, client.id])

  // Verificar se o cliente está próximo de ser chamado
  useEffect(() => {
    if (position !== null && position >= 0 && position <= 3 && position !== -1) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Quase na sua vez!", {
          body: `Faltam apenas ${position} ${position === 1 ? "pessoa" : "pessoas"} para sua vez. Dirija-se para próximo da loja.`,
          icon: "/favicon.ico",
        })
      }
    }
  }, [position])

  const handleAbandon = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/queue/abandon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId: client.id }),
      })

      if (!response.ok) {
        throw new Error("Erro ao desistir da fila")
      }

      toast({
        title: "Desistência confirmada",
        description: "Você saiu da fila com sucesso.",
      })

      onAbandon()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível desistir da fila.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusMessage = () => {
    if (position === -1 || currentTicket?.id === client.id) {
      return (
        <div className="bg-green-100 p-3 sm:p-4 rounded-md text-green-800 text-center">
          <h3 className="text-base sm:text-lg font-bold">É a sua vez!</h3>
          <p className="text-sm sm:text-base">Entre na loja imediatamente.</p>
          <p className="mt-2 text-red-600 font-bold text-xs sm:text-sm">
            Você tem apenas 2 minutos para comparecer ou perderá sua vez!
          </p>
        </div>
      )
    }

    if (position === null) {
      return (
        <div className="bg-red-100 p-3 sm:p-4 rounded-md text-red-800 text-center space-y-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold">Você não está mais na fila</h3>
            <p className="text-sm sm:text-base">Seu atendimento já foi concluído ou você desistiu da fila.</p>
          </div>
          <Button onClick={onReenter} variant="outline" size="sm" className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 mr-2" />
            Entrar na fila novamente
          </Button>
        </div>
      )
    }

    if (position <= 3) {
      return (
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-md text-yellow-800">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <h3 className="text-base sm:text-lg font-bold">Prepare-se!</h3>
          </div>
          <p className="text-center text-sm sm:text-base">
            Sua posição na fila: <span className="font-bold text-lg sm:text-xl">{position + 1}</span>
          </p>
          <p className="text-center font-medium mt-2 text-sm sm:text-base">
            Faltam apenas {position} {position === 1 ? "pessoa" : "pessoas"} para sua vez!
          </p>
          <p className="text-center mt-2 font-bold text-xs sm:text-sm">
            Por favor, dirija-se para próximo da loja agora!
          </p>
        </div>
      )
    }

    return (
      <div className="bg-blue-50 p-3 sm:p-4 rounded-md text-blue-800">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          <h3 className="text-base sm:text-lg font-bold">Aguardando atendimento</h3>
        </div>
        <p className="text-center text-sm sm:text-base">
          Sua posição na fila: <span className="font-bold text-lg sm:text-xl">{position + 1}</span>
        </p>
        <p className="text-center text-xs sm:text-sm mt-1">
          {position === 0
            ? "Você é o próximo!"
            : `Faltam ${position} ${position === 1 ? "pessoa" : "pessoas"} para chegar a sua vez`}
        </p>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Seu Ticket: #{client.ticketNumber}</CardTitle>
        <CardDescription className="text-sm sm:text-base">Olá, {client.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {getStatusMessage()}

        <div className="border rounded-md p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <h3 className="font-medium text-sm sm:text-base">Fila de Atendimento</h3>
            </div>
            <span className="bg-gray-100 text-gray-700 text-xs sm:text-sm px-2 py-1 rounded-md">
              {queueClients.length} na fila
            </span>
          </div>

          {currentTicket && (
            <div className="bg-green-50 border border-green-100 rounded p-2 mb-2">
              <p className="text-xs sm:text-sm font-medium">
                Sendo atendido: <span className="font-bold">{currentTicket.name}</span>
              </p>
            </div>
          )}

          {queueClients.length > 0 ? (
            <div className="max-h-24 sm:max-h-32 overflow-y-auto">
              <ul className="space-y-1">
                {queueClients.slice(0, 5).map((queueClient, index) => (
                  <li
                    key={queueClient.id}
                    className={`text-xs sm:text-sm p-1 rounded ${
                      queueClient.id === client.id ? "bg-blue-50 font-medium" : ""
                    }`}
                  >
                    {index + 1}. {queueClient.name} {queueClient.id === client.id && "(você)"}
                  </li>
                ))}
                {queueClients.length > 5 && (
                  <li className="text-xs sm:text-sm text-gray-500 italic p-1">
                    + {queueClients.length - 5} pessoas na fila...
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 text-center py-2">Não há ninguém na fila</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleAbandon}
          disabled={position === null || isLoading}
          size="sm"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          {isLoading ? "Saindo..." : "Desistir da Fila"}
        </Button>
      </CardFooter>
    </Card>
  )
}
