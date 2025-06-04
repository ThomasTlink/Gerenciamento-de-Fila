"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEmailQueue } from "@/hooks/use-email-queue"
import { Play, Pause, Trash2, RefreshCw, Mail, Clock, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

export default function QueueDashboard() {
  const { stats, jobs, clearCompleted, startProcessing, stopProcessing, refreshData } = useEmailQueue()
  const [isProcessingActive, setIsProcessingActive] = useState(false)

  const handleStartProcessing = () => {
    startProcessing()
    setIsProcessingActive(true)
  }

  const handleStopProcessing = () => {
    stopProcessing()
    setIsProcessingActive(false)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive",
    } as const

    const icons = {
      pending: <Clock className="h-3 w-3" />,
      processing: <RefreshCw className="h-3 w-3 animate-spin" />,
      completed: <CheckCircle className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center gap-1">
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.processing}</p>
                <p className="text-sm text-gray-600">Processando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-600">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.failed}</p>
                <p className="text-sm text-gray-600">Falharam</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controles da Fila</CardTitle>
          <CardDescription>Gerencie o processamento da fila de e-mails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={isProcessingActive ? handleStopProcessing : handleStartProcessing}
              variant={isProcessingActive ? "destructive" : "default"}
            >
              {isProcessingActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Parar Processamento
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Processamento
                </>
              )}
            </Button>

            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button onClick={clearCompleted} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Concluídos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs na Fila</CardTitle>
          <CardDescription>Últimos {jobs.length} jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {jobs.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhum job na fila</p>
            ) : (
              jobs.slice(0, 50).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{Array.isArray(job.to) ? job.to[0] : job.to}</span>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{job.subject}</p>
                    <p className="text-xs text-gray-400">
                      Criado: {new Date(job.createdAt).toLocaleString()}
                      {job.processedAt && ` | Processado: ${new Date(job.processedAt).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Tentativas: {job.attempts}/{job.maxAttempts}
                    </p>
                    {job.error && (
                      <p className="text-xs text-red-500 max-w-xs truncate" title={job.error}>
                        {job.error}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
