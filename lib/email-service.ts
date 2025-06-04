import { Resend } from "resend"
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "./email-config"

const resend = new Resend(EMAIL_CONFIG.resend.apiKey)

interface EmailData {
  to: string
  subject: string
  html: string
  text: string
}

// Função principal para enviar emails
export async function sendEmail(emailData: EmailData) {
  if (EMAIL_CONFIG.provider === "aws") {
    return await sendEmailWithAWS(emailData)
  } else {
    return await sendEmailWithResend(emailData)
  }
}

// Enviar email com Resend
async function sendEmailWithResend(emailData: EmailData) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.resend.fromEmail,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    })

    console.log(`Email enviado via Resend para ${emailData.to}:`, result)
    return result
  } catch (error) {
    console.error("Erro ao enviar email via Resend:", error)
    throw error
  }
}

// Enviar email com AWS SES (comentado, descomente quando migrar)
async function sendEmailWithAWS(emailData: EmailData) {
  try {
    /* 
    // Descomente este bloco quando migrar para AWS SES
    const AWS = require('aws-sdk');
    
    const ses = new AWS.SES({
      region: EMAIL_CONFIG.aws.region,
      accessKeyId: EMAIL_CONFIG.aws.accessKeyId,
      secretAccessKey: EMAIL_CONFIG.aws.secretAccessKey
    });

    const params = {
      Source: EMAIL_CONFIG.aws.fromEmail,
      Destination: { 
        ToAddresses: [emailData.to] 
      },
      Message: {
        Subject: { 
          Data: emailData.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: emailData.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: emailData.text,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const result = await ses.sendEmail(params).promise();
    console.log(`Email enviado via AWS SES para ${emailData.to}:`, result);
    return result;
    */

    // Por enquanto, usar Resend como fallback
    console.log("AWS SES não configurado, usando Resend como fallback")
    return await sendEmailWithResend(emailData)
  } catch (error) {
    console.error("Erro ao enviar email via AWS SES:", error)
    throw error
  }
}

// Funções específicas para cada tipo de email
export async function sendConfirmationEmail(email: string, name: string, ticketNumber: number, position: number) {
  const template = EMAIL_TEMPLATES.confirmation

  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.getHtml(name, ticketNumber, position),
    text: template.getText(name, ticketNumber, position),
  })
}

export async function sendAlmostYourTurnEmail(email: string, name: string, position: number) {
  const template = EMAIL_TEMPLATES.almostYourTurn

  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.getHtml(name, position),
    text: template.getText(name, position),
  })
}

export async function sendNotificationEmail(email: string, name: string) {
  const template = EMAIL_TEMPLATES.notification

  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.getHtml(name),
    text: template.getText(name),
  })
}
