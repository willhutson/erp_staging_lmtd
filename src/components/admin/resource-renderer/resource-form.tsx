"use client";

/**
 * ResourceForm - Dynamic form renderer for create/edit views
 *
 * Renders forms based on resource configuration.
 */

import { useEffect } from "react";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreate, useUpdate, useOne } from "@refinedev/core";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
import { ChevronDown, Loader2, Save, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { RelationPicker, MultiRelationPicker } from "./relation-picker";
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
  const { query } = useOne({
    resource: config.name,
    id: id || "",
    queryOptions: {
      enabled: mode === "edit" && !!id,
    },
  });
  const existingData = query.data;
  const isLoadingData = query.isLoading;

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
  const { mutate: create, mutation: createMutation } = useCreate();
  const { mutate: update, mutation: updateMutation } = useUpdate();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
            toast.success(`${config.label} created`, {
              description: `The ${config.label.toLowerCase()} has been created successfully.`,
              icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            });
            handleRedirect(formView.redirectOnSuccess);
          },
          onError: (error) => {
            toast.error(`Failed to create ${config.label.toLowerCase()}`, {
              description: error.message || "An unexpected error occurred. Please try again.",
              icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            });
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
            toast.success(`${config.label} updated`, {
              description: `The ${config.label.toLowerCase()} has been updated successfully.`,
              icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            });
            handleRedirect(formView.redirectOnSuccess, id);
          },
          onError: (error) => {
            toast.error(`Failed to update ${config.label.toLowerCase()}`, {
              description: error.message || "An unexpected error occurred. Please try again.",
              icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            });
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
  form: UseFormReturn<FieldValues>;
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
  form: UseFormReturn<FieldValues>;
}

function FormFieldRenderer({ field, form }: FormFieldRendererProps) {
  // Determine column span based on field type or width
  const colSpan = field.type === "text" || field.type === "markdown" || field.type === "json"
    ? "md:col-span-2"
    : "";

  const isRequired = field.validation?.required;
  const maxLength = field.validation?.maxLength;

  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField, fieldState }) => {
        const hasError = !!fieldState.error;
        const isDirty = fieldState.isDirty;
        const isValid = isDirty && !hasError;

        // Calculate character count for text fields
        const charCount = typeof formField.value === "string" ? formField.value.length : 0;
        const showCharCount = maxLength && (field.type === "string" || field.type === "text");

        return (
          <FormItem className={colSpan}>
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-1">
                {field.label}
                {isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              {showCharCount && (
                <span className={cn(
                  "text-xs",
                  charCount > maxLength ? "text-red-500" : "text-muted-foreground"
                )}>
                  {charCount}/{maxLength}
                </span>
              )}
            </div>
            <FormControl>
              <div className="relative">
                {renderFormInput(field, formField, hasError)}
                {/* Validation indicator */}
                {isDirty && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : hasError ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
            </FormControl>
            {field.description && !hasError && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// ============================================
// FORM INPUT RENDERERS
// ============================================

// Error input styling
const errorInputClass = "border-red-500 focus-visible:ring-red-500/20";
const validInputClass = "border-green-500 focus-visible:ring-green-500/20";

function renderFormInput(
  field: FieldDefinition,
  formField: {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    name: string;
  },
  hasError?: boolean
): React.ReactNode {
  // Add padding for validation icon
  const inputClass = cn(
    "pr-8",
    hasError && errorInputClass
  );

  switch (field.type) {
    case "string":
    case "email":
    case "url":
    case "phone":
      return (
        <Input
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          placeholder={field.placeholder}
          className={inputClass}
          {...formField}
          value={String(formField.value || "")}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          placeholder={field.placeholder}
          className={inputClass}
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
          className={inputClass}
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
          className={cn(hasError && errorInputClass)}
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
          className={inputClass}
          {...formField}
          value={formField.value ? String(formField.value).split("T")[0] : ""}
        />
      );

    case "datetime":
      return (
        <Input
          type="datetime-local"
          className={inputClass}
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
          <SelectTrigger className={cn(hasError && errorInputClass)}>
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
            className={cn("w-12 h-10 p-1 cursor-pointer", hasError && errorInputClass)}
            {...formField}
            value={String(formField.value || "#000000")}
          />
          <Input
            type="text"
            placeholder="#000000"
            className={cn("flex-1", hasError && errorInputClass)}
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
          className={cn("font-mono text-sm", hasError && errorInputClass)}
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
          className={inputClass}
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

    case "relation":
      // Check if it's a multi-select relation (hasMany)
      if (field.relation?.type === "hasMany") {
        return (
          <MultiRelationPicker
            field={field}
            value={formField.value as string[] | null}
            onChange={formField.onChange}
          />
        );
      }
      // Default: single relation (belongsTo/hasOne)
      return (
        <RelationPicker
          field={field}
          value={formField.value as string | null}
          onChange={formField.onChange}
        />
      );

    default:
      return (
        <Input
          type="text"
          placeholder={field.placeholder}
          className={inputClass}
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
