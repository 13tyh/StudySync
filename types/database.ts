export interface Database {
  public: {
    Tables: {
      study_sessions: {
        Row: {
          id: string
          subject: string
          duration: number
          note: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          subject: string
          duration: number
          note?: string | null
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          subject?: string
          duration?: number
          note?: string | null
          date?: string
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          daily_goal: number
          weekly_goal: number
          daily_todo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          daily_goal: number
          weekly_goal: number
          daily_todo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          daily_goal?: number
          weekly_goal?: number
          daily_todo?: string | null
          created_at?: string
        }
      }
    }
  }
}