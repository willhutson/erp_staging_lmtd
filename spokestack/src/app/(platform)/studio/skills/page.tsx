import { SkillsClient } from "./skills-client";
import { getAvailableSkills } from "@/modules/studio/actions/skill-actions";

export default async function SkillsPage() {
  const skills = await getAvailableSkills();

  return <SkillsClient skills={skills} />;
}
