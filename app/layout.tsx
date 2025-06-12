import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Guido Couros - Fila Digital",
  description: "Sistema de fila digital da Guido Couros. Entre na fila e receba notificações quando for sua vez.",
  keywords: "fila digital, guido couros, atendimento, notificações",
  authors: [{ name: "Guido Couros" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
