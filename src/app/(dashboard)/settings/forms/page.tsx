import Link from "next/link";
import { getFormTemplates } from "@/modules/forms/actions/form-template-actions";
import { Plus, FileText, Check, X } from "lucide-react";
import { FormTemplateActions } from "@/modules/forms/components/FormTemplateActions";

// Type for form template from the action
type FormTemplateRecord = Awaited<ReturnType<typeof getFormTemplates>>[number];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function FormsSettingsPage() {
  const templates = await getFormTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Form Templates</h2>
          <p className="text-sm text-gray-500">
            Create and manage brief form templates for your organization.
          </p>
        </div>
        <Link
          href="/settings/forms/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No form templates yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first form template to start customizing brief forms.
          </p>
          <Link
            href="/settings/forms/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Template
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Sections
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template: FormTemplateRecord) => {
                const config = template.config as { sections?: unknown[] } | null;
                const sectionCount = config?.sections?.length || 0;

                return (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          {template.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {template.type}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {sectionCount} section{sectionCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {template.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <X className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                      {template.isSystem && (
                        <span className="ml-2 text-xs text-gray-400">(System)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <FormTemplateActions
                        templateId={template.id}
                        isSystem={template.isSystem}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
