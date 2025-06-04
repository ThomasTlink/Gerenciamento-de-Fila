import { createServerSupabaseClient } from "./supabase"
import { sendConfirmationEmail, sendNotificationEmail, sendAlmostYourTurnEmail } from "./email-service"

// Função para adicionar cliente à fila
export async function addToQueue(name: string, phone: string, email: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Obter as configurações da fila
    const { data: queueSettings, error: settingsError } = await supabase.from("queue_settings").select("*").single()

    if (settingsError || !queueSettings) {
      console.error("Erro ao obter configurações:", settingsError)
      throw new Error("Configurações da fila não encontradas")
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
      console.error("Erro ao inserir na fila:", error)
      throw new Error(error.message)
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
      console.error("Erro ao atualizar configurações:", updateError)
    }

    // Enviar email de confirmação
    await sendConfirmationEmail(data.email, data.name, newTicketNumber, position + 1)

    return { ...data, ticketNumber: newTicketNumber }
  } catch (error) {
    console.error("Erro no addToQueue:", error)
    throw error
  }
}

// Função para obter o cliente atual sendo atendido
export async function getCurrentTicket() {
  const supabase = createServerSupabaseClient()

  try {
    const { data: settings } = await supabase.from("queue_settings").select("current_ticket").single()

    if (!settings?.current_ticket) {
      return null
    }

    const { data: currentTicket } = await supabase.from("queues").select("*").eq("id", settings.current_ticket).single()

    return currentTicket
  } catch (error) {
    console.error("Erro ao obter ticket atual:", error)
    return null
  }
}

// Função para obter todos os clientes na fila
export async function getQueueClients() {
  const supabase = createServerSupabaseClient()

  try {
    const { data } = await supabase
      .from("queues")
      .select("*")
      .eq("status", "waiting")
      .order("position", { ascending: true })

    return data || []
  } catch (error) {
    console.error("Erro ao obter clientes da fila:", error)
    return []
  }
}

// Função para chamar o próximo cliente
export async function callNextClient() {
  const supabase = createServerSupabaseClient()

  try {
    // Obter o próximo cliente na fila
    const { data: nextClient } = await supabase
      .from("queues")
      .select("*")
      .eq("status", "waiting")
      .order("position", { ascending: true })
      .limit(1)
      .single()

    if (!nextClient) {
      return null
    }

    // Atualizar o status do cliente
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
      throw new Error(updateError.message)
    }

    // Obter configurações para atualizar
    const { data: settings } = await supabase.from("queue_settings").select("id").single()

    if (settings) {
      // Atualizar as configurações da fila
      await supabase
        .from("queue_settings")
        .update({
          current_ticket: nextClient.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
    }

    // Enviar notificação por email
    await sendNotificationEmail(updatedClient.email, updatedClient.name)

    // Verificar se há clientes que precisam ser notificados (faltando 3 pessoas)
    await checkAndNotifyUpcoming()

    return updatedClient
  } catch (error) {
    console.error("Erro ao chamar próximo cliente:", error)
    throw error
  }
}

// Função para verificar e notificar clientes que estão próximos de serem chamados
export async function checkAndNotifyUpcoming() {
  const supabase = createServerSupabaseClient()

  try {
    // Obter clientes na fila
    const { data: clients } = await supabase
      .from("queues")
      .select("*")
      .eq("status", "waiting")
      .order("position", { ascending: true })

    if (!clients || clients.length === 0) {
      return
    }

    // Notificar clientes que estão na posição 3 (faltam 3 pessoas)
    const clientToNotify = clients.find((client) => client.position === 3)
    if (clientToNotify) {
      await sendAlmostYourTurnEmail(clientToNotify.email, clientToNotify.name, 3)
      console.log(`Notificado cliente ${clientToNotify.name} que está próximo de ser chamado`)
    }

    // Notificar clientes que estão na posição 2 (faltam 2 pessoas)
    const clientToNotify2 = clients.find((client) => client.position === 2)
    if (clientToNotify2) {
      await sendAlmostYourTurnEmail(clientToNotify2.email, clientToNotify2.name, 2)
      console.log(`Notificado cliente ${clientToNotify2.name} que está próximo de ser chamado`)
    }

    // Notificar clientes que estão na posição 1 (falta 1 pessoa)
    const clientToNotify1 = clients.find((client) => client.position === 1)
    if (clientToNotify1) {
      await sendAlmostYourTurnEmail(clientToNotify1.email, clientToNotify1.name, 1)
      console.log(`Notificado cliente ${clientToNotify1.name} que está próximo de ser chamado`)
    }
  } catch (error) {
    console.error("Erro ao verificar e notificar clientes próximos:", error)
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

    // Atualizar o status do cliente
    const { error } = await supabase
      .from("queues")
      .update({
        status: "abandoned",
      })
      .eq("id", clientId)

    if (error) {
      throw new Error(error.message)
    }

    // Verificar se há clientes que precisam ser notificados após a desistência
    await checkAndNotifyUpcoming()

    return true
  } catch (error) {
    console.error("Erro ao abandonar fila:", error)
    throw error
  }
}

// Função para completar o atendimento atual
export async function completeCurrentService() {
  const supabase = createServerSupabaseClient()

  try {
    const { data: settings } = await supabase.from("queue_settings").select("current_ticket, id").single()

    if (!settings?.current_ticket) {
      return null
    }

    // Atualizar o status do cliente
    await supabase
      .from("queues")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", settings.current_ticket)

    // Limpar o ticket atual
    await supabase
      .from("queue_settings")
      .update({
        current_ticket: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id)

    // Verificar se há clientes que precisam ser notificados após o atendimento
    await checkAndNotifyUpcoming()

    return true
  } catch (error) {
    console.error("Erro ao completar atendimento:", error)
    throw error
  }
}
