"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Queue } from "@/types/supabase"
import { UserCheck, UserPlus, Users, RefreshCw, LogOut } from "lucide-react"

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentTicket, setCurrentTicket] = useState<Queue | null>(null)
  const [queueClients, setQueueClients] = useState<Queue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchQueueData = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/queue")
      const data = await response.json()

      if (data.currentTicket) {
        setCurrentTicket(data.currentTicket)
      } else {
        setCurrentTicket(null)
      }

      if (data.clients) {
        setQueueClients(data.clients)
      }
    } catch (error) {
      console.error("Erro ao obter dados da fila:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados da fila.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchQueueData()

    // Atualizar a cada 5 segundos
    const interval = setInterval(fetchQueueData, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCallNext = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/queue/next", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao chamar próximo cliente")
      }

      if (data.client) {
        setCurrentTicket(data.client)
        toast({
          title: "Próximo cliente chamado",
          description: `${data.client.name} foi chamado para atendimento.`,
        })
      } else {
        toast({
          title: "Fila vazia",
          description: "Não há mais clientes na fila.",
        })
      }

      // Atualizar a fila
      fetchQueueData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao chamar próximo cliente",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteService = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/queue/complete", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao completar atendimento")
      }

      toast({
        title: "Atendimento concluído",
        description: "O atendimento atual foi concluído com sucesso.",
      })

      setCurrentTicket(null)

      // Atualizar a fila
      fetchQueueData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao completar atendimento",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Painel de atendimento atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Atendimento Atual
            </CardTitle>
            <CardDescription>Cliente sendo atendido no momento</CardDescription>
          </CardHeader>
          <CardContent>
            {currentTicket ? (
              <div className="bg-green-50 border border-green-100 rounded-md p-4">
                <h3 className="font-medium text-lg">{currentTicket.name}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <p className="text-gray-500">Telefone:</p>
                    <p>{currentTicket.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email:</p>
                    <p className="truncate">{currentTicket.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Chamado às:</p>
                    <p>{currentTicket.called_at ? new Date(currentTicket.called_at).toLocaleTimeString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-center">
                <p className="text-gray-500">Nenhum cliente em atendimento</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              onClick={handleCallNext}
              disabled={isLoading || (queueClients.length === 0 && currentTicket !== null)}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {currentTicket ? "Chamar Outro" : "Chamar Próximo"}
            </Button>

            {currentTicket && (
              <Button onClick={handleCompleteService} variant="outline" disabled={isLoading} className="flex-1">
                <UserCheck className="h-4 w-4 mr-2" />
                Concluir Atendimento
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Lista de espera */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Fila de Espera
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchQueueData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <CardDescription>
              {queueClients.length} {queueClients.length === 1 ? "cliente" : "clientes"} aguardando
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queueClients.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {queueClients.map((client, index) => (
                  <div
                    key={client.id}
                    className={`border rounded-md p-3 ${index === 0 ? "bg-blue-50 border-blue-100" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {index + 1}. {client.name}{" "}
                          {index === 0 && <span className="text-blue-600 text-sm">(próximo)</span>}
                        </p>
                        <p className="text-sm text-gray-500">{client.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{new Date(client.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-center">
                <p className="text-gray-500">Não há clientes na fila</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
