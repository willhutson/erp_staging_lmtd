import { getTemplates } from "@/modules/builder/actions";
import { TemplatesClient } from "./templates-client";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return <TemplatesClient initialTemplates={templates} />;
}
