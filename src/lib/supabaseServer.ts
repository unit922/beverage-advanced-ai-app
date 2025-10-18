import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// ✅ await cookies() instead of passing directly
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
}
