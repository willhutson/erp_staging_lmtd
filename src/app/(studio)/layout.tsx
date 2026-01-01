import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudioShell } from "@/components/layout/StudioShell";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <StudioShell>{children}</StudioShell>;
}
