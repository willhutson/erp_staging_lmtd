import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase/server"

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect("/admin") // Go to dashboard if logged in
  } else {
    redirect("/login") // Go to login if not
  }
}
