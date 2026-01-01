import { FormEditor } from "@/modules/forms/components/FormEditor";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function NewFormTemplatePage() {
  return <FormEditor />;
}
