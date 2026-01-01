import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SkillsClient } from "./skills-client";
import { getAvailableSkills } from "@/modules/studio/actions/skill-actions";
import { StudioSetupRequired } from "@/modules/studio/components/StudioSetupRequired";

export default async function SkillsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    const skills = await getAvailableSkills();
    return <SkillsClient skills={skills} />;
  } catch (error) {
    console.error("Studio skills page error:", error);
    return <StudioSetupRequired module="AI Skills" />;
  }
}
