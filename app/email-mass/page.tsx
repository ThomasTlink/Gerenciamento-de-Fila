import BatchEmailForm from "@/components/batch-email-form"
import QueueDashboard from "@/components/queue-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EmailMassPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de E-mails em Massa</h1>
          <p className="text-gray-600">Gerencie envios em lote com sistema de filas</p>
        </div>

        <Tabs defaultValue="send" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Enviar E-mails</TabsTrigger>
            <TabsTrigger value="monitor">Monitorar Fila</TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <BatchEmailForm />
          </TabsContent>

          <TabsContent value="monitor">
            <QueueDashboard />
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas importantes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• O sistema processa automaticamente com rate limiting para respeitar limites do Resend</li>
            <li>• Jobs falhados são automaticamente reprocessados até 3 tentativas</li>
            <li>• Use a aba "Monitorar Fila" para acompanhar o progresso em tempo real</li>
            <li>• Para produção, substitua localStorage por um banco de dados real</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
