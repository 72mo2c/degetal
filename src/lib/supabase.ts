import { createClient } from '@supabase/supabase-js'

// متغيرات البيئة مع قيم افتراضية للاختبار
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zntwnvpydvnrgykmkepj.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudHdudnB5ZHZucmd5a21rZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxNTI1OTgsImV4cCI6MjA1MDcyODU5OH0.y4N36n9Q0nf2xRJdqfbB7NUBjCJpRl5JZ0v8iM3XS0k"

// ملاحظة: سيتم استبدال هذه القيم بالقيم الحقيقية عند الاتصال بالباك إند
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// تصدير معلومات الربط للباك إند
export const backendConfig = {
  supabaseUrl,
  supabaseAnonKey,
  // Edge Functions URLs (سيتم تحديثها عند النشر)
  functions: {
    createPaymentIntent: `${supabaseUrl}/functions/v1/create-payment-intent`,
    deliverDigitalCodes: `${supabaseUrl}/functions/v1/deliver-digital-codes`
  }
}