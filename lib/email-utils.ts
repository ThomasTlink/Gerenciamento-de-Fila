import { renderToString } from "react-dom/server"
import { WelcomeEmail } from "@/components/email-templates/welcome-email"

export function renderWelcomeEmail(firstName: string, loginUrl?: string): string {
  return renderToString(WelcomeEmail({ firstName, loginUrl }))
}

// Função para enviar e-mail de boas-vindas
export async function sendWelcomeEmail(userEmail: string, firstName: string, loginUrl?: string) {
  const html = renderWelcomeEmail(firstName, loginUrl)

  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: userEmail,
      subject: `Bem-vindo, ${firstName}!`,
      html,
    }),
  })

  return response.json()
}
