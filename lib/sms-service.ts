// Configuração do Twilio
const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_FROM_NUMBER || "+1234567890", // Número do Twilio
}

interface SMSData {
  to: string
  message: string
}

// Função principal para enviar SMS
export async function sendSMS(smsData: SMSData) {
  try {
    if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken) {
      console.log("Twilio não configurado, SMS não será enviado")
      return { success: false, message: "Twilio não configurado" }
    }

    /* 
    // Descomente este bloco quando configurar o Twilio
    const twilio = require('twilio');
    const client = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);

    const result = await client.messages.create({
      body: smsData.message,
      from: TWILIO_CONFIG.fromNumber,
      to: smsData.to
    });

    console.log(`SMS enviado via Twilio para ${smsData.to}:`, result.sid);
    return { success: true, sid: result.sid };
    */

    // Por enquanto, apenas simular o envio
    console.log(`[SIMULAÇÃO] SMS para ${smsData.to}: ${smsData.message}`)
    return { success: true, simulated: true }
  } catch (error) {
    console.error("Erro ao enviar SMS via Twilio:", error)
    throw error
  }
}

// Templates de SMS
export const SMS_TEMPLATES = {
  confirmation: {
    getMessage: (name: string, ticketNumber: number, position: number) =>
      `Olá ${name}! Você entrou na fila. Ticket #${ticketNumber}. Posição: ${position}. Acompanhe seu status em tempo real.`,
  },
  almostYourTurn: {
    getMessage: (name: string, position: number) =>
      `${name}, faltam apenas ${position} ${position === 1 ? "pessoa" : "pessoas"} para sua vez! Dirija-se para próximo da loja.`,
  },
  notification: {
    getMessage: (name: string) =>
      `${name}, é a sua vez! Você tem 2 minutos para comparecer ao atendimento ou perderá sua vez na fila.`,
  },
}

// Funções específicas para cada tipo de SMS
export async function sendConfirmationSMS(phone: string, name: string, ticketNumber: number, position: number) {
  const message = SMS_TEMPLATES.confirmation.getMessage(name, ticketNumber, position)
  return await sendSMS({ to: phone, message })
}

export async function sendAlmostYourTurnSMS(phone: string, name: string, position: number) {
  const message = SMS_TEMPLATES.almostYourTurn.getMessage(name, position)
  return await sendSMS({ to: phone, message })
}

export async function sendNotificationSMS(phone: string, name: string) {
  const message = SMS_TEMPLATES.notification.getMessage(name)
  return await sendSMS({ to: phone, message })
}

// Função para testar a configuração do Twilio
export async function testSMSConfiguration() {
  try {
    if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken) {
      console.error("Variáveis TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN não configuradas")
      return false
    }

    return true
  } catch (error) {
    console.error("Erro na configuração de SMS:", error)
    return false
  }
}
