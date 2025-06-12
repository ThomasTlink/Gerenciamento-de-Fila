// Configurações de email
export const EMAIL_CONFIG = {
  // Configurações do Resend
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@filaguidocouros.com.br",
  },

  // Configurações do AWS SES (para migração futura)
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    fromEmail: process.env.AWS_SES_FROM_EMAIL || "noreply@filaguidocouros.com.br",
  },

  // Configuração para escolher o provedor
  provider: process.env.EMAIL_PROVIDER || "resend", // "resend" ou "aws"
}

// Templates de email
export const EMAIL_TEMPLATES = {
  // Email de boas-vindas quando a pessoa entra na fila
  confirmation: {
    subject: "✅ Você entrou na fila - Guido Couros!",
    getHtml: (name: string, ticketNumber: number, position: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎫 Ticket #${ticketNumber}</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Você está na fila da Guido Couros!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${name}! 👋</h2>
          <p style="color: #666; line-height: 1.6;">
            Você entrou na fila com sucesso e recebeu o ticket <strong>#${ticketNumber}</strong>.
          </p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #8B4513;">
            <p style="margin: 0; color: #333;">
              <strong>Sua posição atual:</strong> ${position}º na fila
            </p>
          </div>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #1976d2; margin-top: 0;">📱 O que acontece agora?</h3>
          <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
            <li>Você receberá um aviso quando estiver próximo da sua vez</li>
            <li>Você receberá uma notificação quando for sua vez</li>
            <li>Mantenha seu email e navegador abertos</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            Obrigado pela paciência! 🙏<br>
            <strong>Guido Couros - Sistema de Filas</strong><br>
            <a href="https://filaguidocouros.com.br" style="color: #8B4513;">filaguidocouros.com.br</a>
          </p>
        </div>
      </div>
    `,
    getText: (name: string, ticketNumber: number, position: number) => `
      Ticket #${ticketNumber} - Você está na fila da Guido Couros!
      
      Olá, ${name}!
      
      Você entrou na fila com sucesso.
      Sua posição atual: ${position}º na fila
      
      Você receberá um aviso quando estiver próximo da sua vez.
      Você receberá uma notificação quando for sua vez.
      
      Obrigado pela paciência!
      Guido Couros
    `,
  },

  // Email de aviso quando faltam 3 pessoas
  almostYourTurn: {
    subject: "⏰ Prepare-se! Quase na sua vez - Guido Couros!",
    getHtml: (name: string, position: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Prepare-se!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Faltam apenas ${position} ${position === 1 ? "pessoa" : "pessoas"} para sua vez!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${name}! 👋</h2>
          <p style="color: #666; line-height: 1.6;">
            Você está quase sendo chamado na <strong>Guido Couros</strong>! Faltam apenas <strong>${position} ${position === 1 ? "pessoa" : "pessoas"}</strong> para chegar a sua vez.
          </p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              Por favor, dirija-se para próximo da loja agora!
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            Obrigado pela paciência! 🙏<br>
            <strong>Guido Couros - Sistema de Filas</strong><br>
            <a href="https://filaguidocouros.com.br" style="color: #8B4513;">filaguidocouros.com.br</a>
          </p>
        </div>
      </div>
    `,
    getText: (name: string, position: number) => `
      Prepare-se! Quase na sua vez na Guido Couros!
      
      Olá, ${name}!
      
      Você está quase sendo chamado! Faltam apenas ${position} ${position === 1 ? "pessoa" : "pessoas"} para chegar a sua vez.
      
      Por favor, dirija-se para próximo da loja agora!
      
      Obrigado pela paciência!
      Guido Couros
    `,
  },

  // Email quando a pessoa é chamada
  notification: {
    subject: "🔔 É a sua vez na Guido Couros! Compareça em até 2 minutos!",
    getHtml: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎉 É a sua vez!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Entre na Guido Couros agora!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${name}! 👋</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Chegou a sua vez de ser atendido na <strong>Guido Couros</strong>! Por favor, entre na loja <strong>imediatamente</strong>.
          </p>
        </div>
        
        <div style="background: #ffebee; border: 1px solid #ffcdd2; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #c62828; margin-top: 0; font-size: 18px;">⚠️ ATENÇÃO:</h3>
          <p style="color: #c62828; margin: 0; line-height: 1.6; font-weight: bold;">
            Você tem apenas 2 MINUTOS para comparecer, ou perderá sua vez na fila!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            Obrigado pela paciência! 🙏<br>
            <strong>Guido Couros - Sistema de Filas</strong><br>
            <a href="https://filaguidocouros.com.br" style="color: #8B4513;">filaguidocouros.com.br</a>
          </p>
        </div>
      </div>
    `,
    getText: (name: string) => `
      É a sua vez na Guido Couros!
      
      Olá, ${name}!
      
      Chegou a sua vez de ser atendido!
      Por favor, entre na loja IMEDIATAMENTE.
      
      ATENÇÃO: Você tem apenas 2 MINUTOS para comparecer, ou perderá sua vez na fila!
      
      Obrigado pela paciência!
      Guido Couros
    `,
  },
}
