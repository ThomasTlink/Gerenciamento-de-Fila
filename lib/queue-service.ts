import { createServerSupabaseClient } from "./supabase"
import { sendConfirmationEmail, sendNotificationEmail, sendAlmostYourTurnEmail } from "./email-service"
import { sendConfirmationSMS, sendNotificationSMS, sendAlmostYourTurnSMS } from "./sms-service"

// Função para adicionar cliente à fila
export async function addToQueue(name: string, phone: string, email: string) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("➕ Adicionando cliente à fila:", { name, phone, email })

    // Verificar se as tabelas existem e criar configurações se necessário
    await ensureQueueSettingsExist(supabase)

    // Obter as configurações da fila
    const { data: queueSettings, error: settingsError } = await supabase.from("queue_settings").select("*").single()

    if (settingsError) {
      console.error("❌ Erro ao obter configurações:", settingsError)
      throw new Error(`Configurações da fila não encontradas: ${settingsError.message}`)
    }

    // Incrementar o número do ticket
    const newTicketNumber = queueSettings.last_ticket_number + 1

    // Contar quantas pessoas estão na fila
    const { count } = await supabase.from("queues").select("*", { count: "exact", head: true }).eq("status", "waiting")

    const position = count || 0

    // Adicionar à fila
    const { data, error } = await supabase
      .from("queues")
      .insert({
        name,
        phone,
        email,
        position,
        status: "waiting",
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Erro ao inserir na fila:", error)
      throw new Error(`Erro ao inserir na fila: ${error.message}`)
    }

    // Atualizar o último número de ticket
    const { error: updateError } = await supabase
      .from("queue_settings")
      .update({
        last_ticket_number: newTicketNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", queueSettings.id)

    if (updateError) {
      console.error("⚠️ Erro ao atualizar configurações:", updateError)
    }

    // Enviar notificações (email e SMS) com tratamento de erro
    try {
      await Promise.all([
        sendConfirmationEmail(data.email, data.name, newTicketNumber, position + 1).catch((error) => {
          console.error("⚠️ Erro ao enviar email de confirmação:", error)
        }),
        sendConfirmationSMS(data.phone, data.name, newTicketNumber, position + 1).catch((error) => {
          console.error("⚠️ Erro ao enviar SMS de confirmação:", error)
        }),
      ])
      console.log("📧📱 Notificações enviadas")
    } catch (error) {
      console.error("⚠️ Erro ao enviar notificações:", error)
      // Não falha a operação se as notificações não forem enviadas
    }

    console.log("✅ Cliente adicionado com sucesso:", data.name)
    return { ...data, ticketNumber: newTicketNumber }
  } catch (error) {
    console.error("💥 Erro no addToQueue:", error)
    throw error
  }
}

// Função para obter o cliente atual sendo atendido
export async function getCurrentTicket() {
  try {
    console.log("🔍 Buscando ticket atual...")

    const supabase = createServerSupabaseClient()

    if (!supabase) {
      throw new Error("Falha ao criar cliente Supabase")
    }

    const { data: settings, error: settingsError } = await supabase
      .from("queue_settings")
      .select("current_ticket")
      .single()

    if (settingsError) {
      console.error("❌ Erro ao buscar configurações:", settingsError)

      if (settingsError.code === "PGRST116" || settingsError.message?.includes("does not exist")) {
        console.log("⚠️ Tabela queue_settings não existe ou está vazia")
        return null
      }

      throw new Error(`Erro nas configurações: ${settingsError.message}`)
    }

    if (!settings?.current_ticket) {
      console.log("ℹ️ Nenhum ticket atual definido")
      return null
    }

    const { data: currentTicket, error: ticketError } = await supabase
      .from("queues")
      .select("*")
      .eq("id", settings.current_ticket)
      .single()

    if (ticketError) {
      console.error("❌ Erro ao buscar ticket atual:", ticketError)

      if (ticketError.code === "PGRST116") {
        console.log("⚠️ Ticket atual não existe mais, limpando referência")
        return null
      }

      throw new Error(`Erro ao buscar ticket: ${ticketError.message}`)
    }

    console.log("✅ Ticket atual encontrado:", currentTicket?.name)
    return currentTicket
  } catch (error) {
    console.error("💥 Erro crítico ao obter ticket atual:", error)
    return null
  }
}

// Função para obter todos os clientes na fila
export async function getQueueClients() {
  try {
    console.log("🔍 Buscando clientes na fila...")

    const supabase = createServerSupabaseClient()

    if (!supabase) {
      throw new Error("Falha ao criar cliente Supabase")
    }

    const { data, error } = await supabase
      .from("queues")
      .select("*")
      .eq("status", "waiting")
      .order("position", { ascending: true })

    if (error) {
      console.error("❌ Erro ao buscar clientes:", error)

      if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
        console.log("⚠️ Tabela queues não existe")
        return []
      }

      throw new Error(`Erro ao buscar clientes: ${error.message}`)
    }

    console.log(`✅ ${data?.length || 0} clientes encontrados na fila`)
    return data || []
  } catch (error) {
    console.error("💥 Erro crítico ao obter clientes da fila:", error)
    return []
  }
}

// Função auxiliar para garantir que as configurações existam
async function ensureQueueSettingsExist(supabase: any) {
  try {
    const { data: existing } = await supabase.from("queue_settings").select("id").single()

    if (!existing) {
      console.log("🔧 Criando configurações iniciais da fila...")
      await supabase.from("queue_settings").insert({
        current_ticket: null,
        last_ticket_number: 0,
      })
    }
  } catch (error) {
    console.log("ℹ️ Configurações da fila já existem ou erro esperado:", error)
  }
}

// Função para chamar o próximo cliente
export async function callNextClient() {
  const supabase = createServerSupabaseClient()

  try {
    console.log("📞 Chamando próximo cliente...")

    const { data: nextClient } = await supabase
      .from("queues")
      .select("*")
      .eq("status", "waiting")
      .order("position", { ascending: true })
      .limit(1)
      .single()

    if (!nextClient) {
      console.log("ℹ️ Não há clientes na fila")
      return null
    }

    const { data: updatedClient, error: updateError } = await supabase
      .from("queues")
      .update({
        status: "being_served",
        called_at: new Date().toISOString(),
      })
      .eq("id", nextClient.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Erro ao atualizar cliente: ${updateError.message}`)
    }

    await ensureQueueSettingsExist(supabase)

    const { data: settings } = await supabase.from("queue_settings").select("id").single()

    if (settings) {
      await supabase
        .from("queue_settings")
        .update({
          current_ticket: nextClient.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
    }

    // Enviar notificações (email e SMS) com tratamento de erro
    try {
      await Promise.all([
        sendNotificationEmail(updatedClient.email, updatedClient.name).catch((error) => {
          console.error("⚠️ Erro ao enviar email de notificação:", error)
        }),
        sendNotificationSMS(updatedClient.phone, updatedClient.name).catch((error) => {
          console.error("⚠️ Erro ao enviar SMS de notificação:", error)
        }),
      ])
      console.log("📧📱 Notificações de chamada enviadas")
    } catch (error) {
      console.error("⚠️ Erro ao enviar notificações:", error)
    }

    await checkAndNotifyUpcoming()

    console.log("✅ Cliente chamado com sucesso:", updatedClient.name)
    return updatedClient
  } catch (error) {
    console.error("💥 Erro ao chamar próximo cliente:", error)
    throw error
  }
}

// Função para verificar e notificar clientes que estão próximos de serem chamados
export async function checkAndNotifyUpcoming() {
  const supabase = createServerSupabaseClient()

  try {
    const { data: clients } = await supabase
      .from("queues")
      .select("*")
      .eq("status", "waiting")
      .order("position", { ascending: true })

    if (!clients || clients.length === 0) {
      return
    }

    // Notificar clientes nas posições 1, 2 e 3
    for (const position of [1, 2, 3]) {
      const clientToNotify = clients.find((client) => client.position === position)
      if (clientToNotify) {
        try {
          await Promise.all([
            sendAlmostYourTurnEmail(clientToNotify.email, clientToNotify.name, position).catch((error) => {
              console.error("⚠️ Erro ao enviar email de aviso:", error)
            }),
            sendAlmostYourTurnSMS(clientToNotify.phone, clientToNotify.name, position).catch((error) => {
              console.error("⚠️ Erro ao enviar SMS de aviso:", error)
            }),
          ])
          console.log(`📧📱 Notificado cliente ${clientToNotify.name} (posição ${position})`)
        } catch (error) {
          console.error("⚠️ Erro ao enviar notificações de aviso:", error)
        }
      }
    }
  } catch (error) {
    console.error("💥 Erro ao verificar e notificar clientes próximos:", error)
  }
}

// Função para desistir da fila
export async function abandonQueue(clientId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: client } = await supabase.from("queues").select("position").eq("id", clientId).single()

    if (!client) {
      throw new Error("Cliente não encontrado")
    }

    const { error } = await supabase
      .from("queues")
      .update({
        status: "abandoned",
      })
      .eq("id", clientId)

    if (error) {
      throw new Error(`Erro ao abandonar fila: ${error.message}`)
    }

    await checkAndNotifyUpcoming()

    return true
  } catch (error) {
    console.error("💥 Erro ao abandonar fila:", error)
    throw error
  }
}

// Função para completar o atendimento atual
export async function completeCurrentService() {
  const supabase = createServerSupabaseClient()

  try {
    const { data: settings } = await supabase.from("queue_settings").select("current_ticket, id").single()

    if (!settings?.current_ticket) {
      console.log("ℹ️ Nenhum atendimento atual para completar")
      return null
    }

    await supabase
      .from("queues")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", settings.current_ticket)

    await supabase
      .from("queue_settings")
      .update({
        current_ticket: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id)

    await checkAndNotifyUpcoming()

    console.log("✅ Atendimento completado com sucesso")
    return true
  } catch (error) {
    console.error("💥 Erro ao completar atendimento:", error)
    throw error
  }
}
