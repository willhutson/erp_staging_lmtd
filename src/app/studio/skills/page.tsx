import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SkillsClient } from "./skills-client";
import { getAvailableSkills } from "@/modules/studio/actions/skill-actions";

export default async function SkillsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const skills = await getAvailableSkills();

  return <SkillsClient skills={skills} />;
}
