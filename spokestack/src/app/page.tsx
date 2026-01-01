import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase/server"

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect("/hub") // Go to module hub if logged in
  } else {
    redirect("/login") // Go to login if not
  }
}
