import { redirect } from "next/navigation"

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function Home() {
  redirect("/login")
}
