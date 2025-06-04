import EmailTest from "@/components/email-test"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Página de Testes</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Teste do Sistema de Email</h2>
              <p className="text-gray-600">Use esta página para testar o envio de emails</p>
            </div>

            <EmailTest />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📧 Configuração de Email:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Atualmente usando: <strong>Resend</strong>
                </li>
                <li>• Para migrar para AWS SES, descomente o código em email-service.ts</li>
                <li>• Configure as variáveis de ambiente AWS no .env</li>
                <li>• Altere EMAIL_PROVIDER para "aws" no .env</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
