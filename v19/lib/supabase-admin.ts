import { createClient } from "@supabase/supabase-js"

function requiredEnv(variable: string, fallback: string) {
  if (process.env[variable]) return process.env[variable]!
  console.warn(
    `[supabase-admin] 环境变量 ${variable} 未设置，正在使用仅供本地预览的占位值，请在部署到 Vercel 时在 Project Settings → Environment Variables 中配置真实值。`,
  )
  return fallback
}

const supabaseUrl = requiredEnv("SUPABASE_URL", "http://localhost:54321")
const supabaseServiceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key")

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // Server-side operations don't need session persistence
  },
})
