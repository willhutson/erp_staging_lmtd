import { SkillsClient } from "./skills-client";
import { getAvailableSkills } from "@/modules/studio/actions/skill-actions";
import { AlertTriangle } from "lucide-react";

function SkillsError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">AI Skills Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load AI skills. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function SkillsPage() {
  try {
    const skills = await getAvailableSkills();
    return <SkillsClient skills={skills} />;
  } catch (error) {
    console.error("Studio skills page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <SkillsError message={message} />;
  }
}
