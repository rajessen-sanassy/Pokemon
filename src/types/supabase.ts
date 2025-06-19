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
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      collections: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      collection_cards: {
        Row: {
          id: string
          collection_id: string
          card_id: string
          quantity: number
          purchase_price: number | null
          purchase_date: string | null
          condition: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          card_id: string
          quantity?: number
          purchase_price?: number | null
          purchase_date?: string | null
          condition?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          card_id?: string
          quantity?: number
          purchase_price?: number | null
          purchase_date?: string | null
          condition?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_cards_collection_id_fkey"
            columns: ["collection_id"]
            referencedRelation: "collections"
            referencedColumns: ["id"]
          }
        ]
      }
      cards: {
        Row: {
          id: string
          original_id: string | null
          name: string
          image_url: string
          set_name: string
          set_code: string
          card_number: string
          rarity: string
          artist: string | null
          release_date: string | null
          market_price: number | null
          types: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          original_id?: string | null
          name: string
          image_url: string
          set_name: string
          set_code: string
          card_number: string
          rarity: string
          artist?: string | null
          release_date?: string | null
          market_price?: number | null
          types?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          original_id?: string | null
          name?: string
          image_url?: string
          set_name?: string
          set_code?: string
          card_number?: string
          rarity?: string
          artist?: string | null
          release_date?: string | null
          market_price?: number | null
          types?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 