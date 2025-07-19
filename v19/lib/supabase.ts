export const IS_FAKE_SUPABASE = !process.env.SUPABASE_URL || process.env.SUPABASE_URL === "http://localhost:54321"

function requiredEnv(variable: string, fallback: string) {
  if (process.env[variable]) return process.env[variable]!
  console.warn(
    `[supabase] 环境变量 ${variable} 未设置，正在使用仅供本地预览的占位值，请在部署到 Vercel 时在 Project Settings → Environment Variables 中配置真实值。`,
  )
  return fallback
}

import { createClient } from "@supabase/supabase-js"

// const supabaseUrl = process.env.SUPABASE_URL!
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseUrl = requiredEnv("SUPABASE_URL", "http://localhost:54321")
const supabaseAnonKey = requiredEnv("SUPABASE_ANON_KEY", "public-anon-key")

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Server-side operations don't need session persistence
  },
})
