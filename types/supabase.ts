export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      queues: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          status: "waiting" | "being_served" | "completed" | "abandoned"
          position: number | null
          created_at: string
          called_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          status?: "waiting" | "being_served" | "completed" | "abandoned"
          position?: number | null
          created_at?: string
          called_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          status?: "waiting" | "being_served" | "completed" | "abandoned"
          position?: number | null
          created_at?: string
          called_at?: string | null
          completed_at?: string | null
        }
      }
      queue_settings: {
        Row: {
          id: string
          current_ticket: string | null
          last_ticket_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          current_ticket?: string | null
          last_ticket_number?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          current_ticket?: string | null
          last_ticket_number?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Queue = Database["public"]["Tables"]["queues"]["Row"]
export type QueueSettings = Database["public"]["Tables"]["queue_settings"]["Row"]
