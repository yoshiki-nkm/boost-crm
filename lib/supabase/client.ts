import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  )
}

// Supabaseクライアントの作成（型安全）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

