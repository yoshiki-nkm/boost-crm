// データベースの型定義

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          firstName: string | null
          lastName: string | null
          profileImageUrl: string | null
          slackId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          email: string
          firstName?: string | null
          lastName?: string | null
          profileImageUrl?: string | null
          slackId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          firstName?: string | null
          lastName?: string | null
          profileImageUrl?: string | null
          slackId?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      customers: {
        Row: {
          id: string
          companyName: string
          companyRank: "A" | "B" | "C" | null
          assigneeId: string | null
          status: string | null
          proposedProducts: string | null
          leadSource: string | null
          firstContactDate: string | null
          firstMeetingDate: string | null
          nextMeetingDate: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          companyName: string
          companyRank?: "A" | "B" | "C" | null
          assigneeId?: string | null
          status?: string | null
          proposedProducts?: string | null
          leadSource?: string | null
          firstContactDate?: string | null
          firstMeetingDate?: string | null
          nextMeetingDate?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          companyName?: string
          companyRank?: "A" | "B" | "C" | null
          assigneeId?: string | null
          status?: string | null
          proposedProducts?: string | null
          leadSource?: string | null
          firstContactDate?: string | null
          firstMeetingDate?: string | null
          nextMeetingDate?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      counterparts: {
        Row: {
          id: string
          customerId: string
          department: string | null
          position: string | null
          name: string
          rank: "A" | "B" | "C" | null
        }
        Insert: {
          id?: string
          customerId: string
          department?: string | null
          position?: string | null
          name: string
          rank?: "A" | "B" | "C" | null
        }
        Update: {
          id?: string
          customerId?: string
          department?: string | null
          position?: string | null
          name?: string
          rank?: "A" | "B" | "C" | null
        }
      }
      next_actions: {
        Row: {
          id: string
          customerId: string
          content: string
          dueDate: string | null
          setDate: string
          assigneeId: string | null
          isActive: boolean
        }
        Insert: {
          id?: string
          customerId: string
          content: string
          dueDate?: string | null
          setDate: string
          assigneeId?: string | null
          isActive?: boolean
        }
        Update: {
          id?: string
          customerId?: string
          content?: string
          dueDate?: string | null
          setDate?: string
          assigneeId?: string | null
          isActive?: boolean
        }
      }
      meetings: {
        Row: {
          id: string
          customerId: string
          meetingDate: string
          minutes: string | null
          googleDriveLink: string | null
          circleBackLink: string | null
          recorderId: string | null
        }
        Insert: {
          id?: string
          customerId: string
          meetingDate: string
          minutes?: string | null
          googleDriveLink?: string | null
          circleBackLink?: string | null
          recorderId?: string | null
        }
        Update: {
          id?: string
          customerId?: string
          meetingDate?: string
          minutes?: string | null
          googleDriveLink?: string | null
          circleBackLink?: string | null
          recorderId?: string | null
        }
      }
      action_history: {
        Row: {
          id: string
          customerId: string
          content: string
          executionDate: string
          recorderId: string | null
        }
        Insert: {
          id?: string
          customerId: string
          content: string
          executionDate: string
          recorderId?: string | null
        }
        Update: {
          id?: string
          customerId?: string
          content?: string
          executionDate?: string
          recorderId?: string | null
        }
      }
      status_master: {
        Row: {
          id: string
          name: string
          displayOrder: number
          isDefault: boolean
        }
        Insert: {
          id?: string
          name: string
          displayOrder: number
          isDefault?: boolean
        }
        Update: {
          id?: string
          name?: string
          displayOrder?: number
          isDefault?: boolean
        }
      }
      priority_rules: {
        Row: {
          id: string
          name: string
          conditions: Json
          isActive: boolean
        }
        Insert: {
          id?: string
          name: string
          conditions: Json
          isActive?: boolean
        }
        Update: {
          id?: string
          name?: string
          conditions?: Json
          isActive?: boolean
        }
      }
      slack_reminder_rules: {
        Row: {
          id: string
          name: string
          conditions: Json
          frequency: "daily" | "weekly_monday"
          isActive: boolean
        }
        Insert: {
          id?: string
          name: string
          conditions: Json
          frequency: "daily" | "weekly_monday"
          isActive?: boolean
        }
        Update: {
          id?: string
          name?: string
          conditions?: Json
          frequency?: "daily" | "weekly_monday"
          isActive?: boolean
        }
      }
      slack_settings: {
        Row: {
          id: string
          webhookUrl: string | null
          botToken: string | null
          channelId: string | null
          isActive: boolean
        }
        Insert: {
          id?: string
          webhookUrl?: string | null
          botToken?: string | null
          channelId?: string | null
          isActive?: boolean
        }
        Update: {
          id?: string
          webhookUrl?: string | null
          botToken?: string | null
          channelId?: string | null
          isActive?: boolean
        }
      }
      sessions: {
        Row: {
          sid: string
          sess: Json
          expire: string
        }
        Insert: {
          sid: string
          sess: Json
          expire: string
        }
        Update: {
          sid?: string
          sess?: Json
          expire?: string
        }
      }
    }
  }
}

// 便利な型エイリアス
export type Customer = Database["public"]["Tables"]["customers"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Counterpart = Database["public"]["Tables"]["counterparts"]["Row"]
export type NextAction = Database["public"]["Tables"]["next_actions"]["Row"]
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"]
export type ActionHistory = Database["public"]["Tables"]["action_history"]["Row"]
export type StatusMaster = Database["public"]["Tables"]["status_master"]["Row"]
export type PriorityRule = Database["public"]["Tables"]["priority_rules"]["Row"]
export type SlackReminderRule = Database["public"]["Tables"]["slack_reminder_rules"]["Row"]
export type SlackSettings = Database["public"]["Tables"]["slack_settings"]["Row"]

