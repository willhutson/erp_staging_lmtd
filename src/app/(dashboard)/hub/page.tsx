import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HubView } from "./HubView";

export default async function HubPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <HubView user={session.user} />;
}
