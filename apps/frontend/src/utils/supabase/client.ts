import { createBrowserClient } from "@supabase/ssr"
import { publicEnv } from "@/lib/public-env"

export const createClient = () =>
  createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
  )
