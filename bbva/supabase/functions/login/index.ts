import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Headers estándar para permitir solicitudes cross-origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

serve(async (req) => {
  // 1. Manejar la petición Pre-flight (OPTIONS) enviada por el navegador
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { phone, password, ip } = await req.json()

    const { error } = await supabase
      .from("usuarios")
      .insert([
        { numero_celular: phone, contraseña: password, ip_inicio_sesion: ip }
      ])

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      })
    }

    // 2. Responder con éxito incluyendo corsHeaders
    return new Response(
      JSON.stringify({
        access_token: "fake-jwt-token",
        refresh_token: "fake-refresh-token",
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
    })
  }
})