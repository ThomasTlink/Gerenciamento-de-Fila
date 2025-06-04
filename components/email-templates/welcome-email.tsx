import type React from "react"
interface WelcomeEmailProps {
  firstName: string
  loginUrl?: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ firstName, loginUrl = "https://example.com/login" }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
    <h1 style={{ color: "#333", textAlign: "center" }}>Bem-vindo, {firstName}!</h1>
    <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#666" }}>
      Obrigado por se cadastrar em nossa plataforma. Estamos muito felizes em tê-lo conosco!
    </p>
    <div style={{ textAlign: "center", margin: "30px 0" }}>
      <a
        href={loginUrl}
        style={{
          backgroundColor: "#007cba",
          color: "white",
          padding: "12px 24px",
          textDecoration: "none",
          borderRadius: "5px",
          display: "inline-block",
        }}
      >
        Acessar Plataforma
      </a>
    </div>
    <p style={{ fontSize: "14px", color: "#999", textAlign: "center" }}>
      Se você não se cadastrou, pode ignorar este e-mail.
    </p>
  </div>
)
