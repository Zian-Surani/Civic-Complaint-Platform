import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: name => cookies().get(name)?.value,
        set: (name, value, options) =>
          cookies().set({ name, value, ...options }),
        remove: (name, options) =>
          cookies().set({ name, value: '', ...options }),
      },
    }
  )
}
