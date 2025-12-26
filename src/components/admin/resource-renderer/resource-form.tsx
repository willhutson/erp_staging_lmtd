"use client";

/**
 * ResourceForm - Dynamic form renderer for create/edit views
 *
 * Renders forms based on resource configuration.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreate, useUpdate, useOne } from "@refinedev/core";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Loader2, Save, ArrowLeft } from "lucide-react";
import type { ResourceConfig, FieldDefinition, FormSection, FormView } from "@config/resources/types";

interface ResourceFormProps {
  config: ResourceConfig;
  mode: "create" | "edit";
  id?: string;
}

export function ResourceForm({ config, mode, id }: ResourceFormProps) {
  const router = useRouter();
  const formView = mode === "create" ? config.create : config.edit;

  if (!formView) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            {mode === "create" ? "Creation" : "Editing"} is not enabled for this resource.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fetch existing data for edit mode
  const { data: existingData, isLoading: isLoadingData } = useOne({
    resource: config.name,
    id: id || "",
    queryOptions: {
      enabled: mode === "edit" && !!id,
    },
  });

  // Build Zod schema from field definitions
  const schema = buildZodSchema(config.fields, formView);

  // Initialize form
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(config.fields, formView),
  });

  // Update form when existing data loads
  useEffect(() => {
    if (mode === "edit" && existingData?.data) {
      const data = existingData.data as Record<string, unknown>;
      const formFields = getFormFieldNames(formView);
      const values: Record<string, unknown> = {};

      formFields.forEach((fieldName) => {
        if (fieldName in data) {
          values[fieldName] = data[fieldName];
        }
      });

      form.reset(values);
    }
  }, [existingData, mode, form]);

  // Mutations
  const { mutate: create, isLoading: isCreating } = useCreate();
  const { mutate: update, isLoading: isUpdating } = useUpdate();

  const isSubmitting = isCreating || isUpdating;

  // Handle form submission
  const onSubmit = (values: z.infer<typeof schema>) => {
    if (mode === "create") {
      create(
        {
          resource: config.name,
          values,
        },
        {
          onSuccess: () => {
            handleRedirect(formView.redirectOnSuccess);
          },
        }
      );
    } else {
      update(
        {
          resource: config.name,
          id: id || "",
          values,
        },
        {
          onSuccess: () => {
            handleRedirect(formView.redirectOnSuccess, id);
          },
        }
      );
    }
  };

  // Handle redirect after save
  const handleRedirect = (redirect?: string, recordId?: string) => {
    switch (redirect) {
      case "list":
        router.push(`/admin/${config.name}`);
        break;
      case "show":
        router.push(`/admin/${config.name}/${recordId || id}`);
        break;
      case "edit":
        // Stay on edit page
        break;
      default:
        if (redirect) {
          router.push(redirect);
        } else {
          router.push(`/admin/${config.name}`);
        }
    }
  };

  // Get field definition by name
  const getField = (name: string): FieldDefinition | undefined => {
    return config.fields.find((f) => f.name === name);
  };

  // Loading state for edit mode
  if (mode === "edit" && isLoadingData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/${config.name}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? `New ${config.label}` : `Edit ${config.label}`}
          </h1>
          {config.description && (
            <p className="text-muted-foreground">{config.description}</p>
          )}
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formView.sections.map((section) => (
            <FormSectionCard
              key={section.id}
              section={section}
              fields={config.fields}
              form={form}
              getField={getField}
            />
          ))}

          {/* Submit buttons */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {formView.submitLabel || "Save"}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/${config.name}`}>
                {formView.cancelLabel || "Cancel"}
              </Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// ============================================
// FORM SECTION COMPONENT
// ============================================

interface FormSectionCardProps {
  section: FormSection;
  fields: FieldDefinition[];
  form: ReturnType<typeof useForm>;
  getField: (name: string) => FieldDefinition | undefined;
}

function FormSectionCard({ section, fields, form, getField }: FormSectionCardProps) {
  const sectionFields = section.fields
    .map((name) => getField(name))
    .filter((f): f is FieldDefinition => !!f);

  const content = (
    <div className="grid gap-4 md:grid-cols-2">
      {sectionFields.map((field) => (
        <FormFieldRenderer
          key={field.name}
          field={field}
          form={form}
        />
      ))}
    </div>
  );

  if (section.collapsible) {
    return (
      <Collapsible defaultOpen={section.defaultOpen !== false}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>{content}</CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{section.title}</CardTitle>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// ============================================
// FORM FIELD RENDERER
// ============================================

interface FormFieldRendererProps {
  field: FieldDefinition;
  form: ReturnType<typeof useForm>;
}

function FormFieldRenderer({ field, form }: FormFieldRendererProps) {
  // Determine column span based on field type or width
  const colSpan = field.type === "text" || field.type === "markdown" || field.type === "json"
    ? "md:col-span-2"
    : "";

  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem className={colSpan}>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            {renderFormInput(field, formField)}
          </FormControl>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ============================================
// FORM INPUT RENDERERS
// ============================================

function renderFormInput(
  field: FieldDefinition,
  formField: {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    name: string;
  }
): React.ReactNode {
  switch (field.type) {
    case "string":
    case "email":
    case "url":
    case "phone":
      return (
        <Input
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          placeholder={field.placeholder}
          {...formField}
          value={String(formField.value || "")}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          placeholder={field.placeholder}
          {...formField}
          value={formField.value as number || ""}
          onChange={(e) => formField.onChange(e.target.valueAsNumber || null)}
        />
      );

    case "decimal":
      return (
        <Input
          type="number"
          step="0.01"
          placeholder={field.placeholder}
          {...formField}
          value={formField.value as number || ""}
          onChange={(e) => formField.onChange(e.target.valueAsNumber || null)}
        />
      );

    case "text":
    case "markdown":
      return (
        <Textarea
          placeholder={field.placeholder}
          rows={4}
          {...formField}
          value={String(formField.value || "")}
        />
      );

    case "boolean":
      return (
        <Switch
          checked={Boolean(formField.value)}
          onCheckedChange={formField.onChange}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          {...formField}
          value={formField.value ? String(formField.value).split("T")[0] : ""}
        />
      );

    case "datetime":
      return (
        <Input
          type="datetime-local"
          {...formField}
          value={formField.value ? String(formField.value).slice(0, 16) : ""}
        />
      );

    case "select":
    case "enum":
      return (
        <Select
          value={String(formField.value || "")}
          onValueChange={formField.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "color":
      return (
        <div className="flex items-center gap-2">
          <Input
            type="color"
            className="w-12 h-10 p-1 cursor-pointer"
            {...formField}
            value={String(formField.value || "#000000")}
          />
          <Input
            type="text"
            placeholder="#000000"
            className="flex-1"
            {...formField}
            value={String(formField.value || "")}
          />
        </div>
      );

    case "json":
    case "code":
      return (
        <Textarea
          placeholder={field.placeholder || "{}"}
          rows={6}
          className="font-mono text-sm"
          {...formField}
          value={
            typeof formField.value === "object"
              ? JSON.stringify(formField.value, null, 2)
              : String(formField.value || "")
          }
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              formField.onChange(parsed);
            } catch {
              // Keep as string if not valid JSON
              formField.onChange(e.target.value);
            }
          }}
        />
      );

    case "tags":
      return (
        <Input
          type="text"
          placeholder={field.placeholder || "Enter tags, comma-separated"}
          {...formField}
          value={
            Array.isArray(formField.value)
              ? formField.value.join(", ")
              : String(formField.value || "")
          }
          onChange={(e) => {
            const tags = e.target.value.split(",").map((t) => t.trim());
            formField.onChange(tags);
          }}
        />
      );

    // TODO: Add relation picker, file upload, etc.
    case "relation":
      return (
        <Input
          type="text"
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()} ID`}
          {...formField}
          value={String(formField.value || "")}
        />
      );

    default:
      return (
        <Input
          type="text"
          placeholder={field.placeholder}
          {...formField}
          value={String(formField.value || "")}
        />
      );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildZodSchema(
  fields: FieldDefinition[],
  formView: FormView
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const formFieldNames = getFormFieldNames(formView);
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  fields
    .filter((f) => formFieldNames.includes(f.name))
    .forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case "string":
        case "text":
        case "email":
        case "url":
        case "phone":
        case "color":
        case "slug":
        case "markdown":
        case "tags":
          fieldSchema = z.string();
          if (field.validation?.minLength) {
            fieldSchema = (fieldSchema as z.ZodString).min(field.validation.minLength);
          }
          if (field.validation?.maxLength) {
            fieldSchema = (fieldSchema as z.ZodString).max(field.validation.maxLength);
          }
          break;

        case "number":
          fieldSchema = z.number();
          if (field.validation?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(field.validation.max);
          }
          break;

        case "decimal":
          fieldSchema = z.number();
          break;

        case "boolean":
          fieldSchema = z.boolean();
          break;

        case "date":
        case "datetime":
          fieldSchema = z.string();
          break;

        case "select":
        case "enum":
          if (field.options) {
            fieldSchema = z.enum(
              field.options.map((o) => o.value) as [string, ...string[]]
            );
          } else {
            fieldSchema = z.string();
          }
          break;

        case "json":
        case "code":
          fieldSchema = z.unknown();
          break;

        case "relation":
          fieldSchema = z.string();
          break;

        default:
          fieldSchema = z.string();
      }

      // Make optional if not required
      if (!field.validation?.required) {
        fieldSchema = fieldSchema.optional().nullable();
      }

      schemaFields[field.name] = fieldSchema;
    });

  return z.object(schemaFields);
}

function getFormFieldNames(formView: FormView): string[] {
  return formView.sections.flatMap((s) => s.fields);
}

function getDefaultValues(
  fields: FieldDefinition[],
  formView: FormView
): Record<string, unknown> {
  const formFieldNames = getFormFieldNames(formView);
  const defaults: Record<string, unknown> = {};

  fields
    .filter((f) => formFieldNames.includes(f.name))
    .forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      } else {
        // Set type-appropriate defaults
        switch (field.type) {
          case "boolean":
            defaults[field.name] = false;
            break;
          case "number":
          case "decimal":
            defaults[field.name] = null;
            break;
          case "json":
          case "code":
            defaults[field.name] = {};
            break;
          case "tags":
            defaults[field.name] = [];
            break;
          default:
            defaults[field.name] = "";
        }
      }
    });

  return defaults;
}
