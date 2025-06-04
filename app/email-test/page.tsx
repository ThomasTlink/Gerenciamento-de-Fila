import EmailForm from "@/components/email-form"

export default function EmailTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de E-mails</h1>
          <p className="text-gray-600">Teste o envio de e-mails com Resend</p>
        </div>

        <EmailForm />

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Como usar:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Configure seu domínio no Resend para usar um remetente personalizado</li>
            <li>• Use templates React para e-mails mais elaborados</li>
            <li>• Implemente validações adicionais conforme necessário</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
