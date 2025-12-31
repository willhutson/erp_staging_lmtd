import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewTemplateForm } from "./NewTemplateForm";

export default async function NewTemplatePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.permissionLevel !== "ADMIN") {
    redirect("/hub");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">New Template</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new template for the platform
        </p>
      </div>

      <NewTemplateForm />
    </div>
  );
}
