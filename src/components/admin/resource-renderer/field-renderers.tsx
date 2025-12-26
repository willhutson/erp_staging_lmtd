"use client";

/**
 * Field Renderers for Resource Builder
 *
 * Renders different field types in list, show, and form views.
 */

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { FieldDefinition, SelectOption } from "@config/resources/types";
import {
  Check,
  X,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Clock,
  Hash,
  FileText,
} from "lucide-react";

// ============================================
// LIST CELL RENDERERS
// ============================================

interface CellProps {
  value: unknown;
  field: FieldDefinition;
  record: Record<string, unknown>;
}

export function renderCell({ value, field, record }: CellProps): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  switch (field.type) {
    case "string":
    case "text":
      return <span className="truncate max-w-[200px]">{String(value)}</span>;

    case "number":
    case "decimal":
      return <span className="font-mono">{formatNumber(value, field)}</span>;

    case "boolean":
      return value ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      );

    case "date":
      return (
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {formatDate(value)}
        </span>
      );

    case "datetime":
      return (
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          {formatDateTime(value)}
        </span>
      );

    case "email":
      return (
        <a
          href={`mailto:${value}`}
          className="flex items-center gap-1.5 text-primary hover:underline"
        >
          <Mail className="h-3.5 w-3.5" />
          {String(value)}
        </a>
      );

    case "url":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Link
        </a>
      );

    case "phone":
      return (
        <a
          href={`tel:${value}`}
          className="flex items-center gap-1.5 text-primary hover:underline"
        >
          <Phone className="h-3.5 w-3.5" />
          {String(value)}
        </a>
      );

    case "select":
    case "enum":
      return renderSelectValue(value, field.options);

    case "multi-select":
      return renderMultiSelectValue(value, field.options);

    case "image":
      return renderImage(value);

    case "relation":
      return renderRelation(value, field, record);

    case "tags":
      return renderTags(value);

    case "color":
      return renderColor(value);

    case "json":
      return (
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">JSON</span>
        </span>
      );

    default:
      return <span>{String(value)}</span>;
  }
}

// ============================================
// SHOW FIELD RENDERERS
// ============================================

interface ShowFieldProps {
  value: unknown;
  field: FieldDefinition;
  record: Record<string, unknown>;
}

export function renderShowField({ value, field, record }: ShowFieldProps): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">Not set</span>;
  }

  switch (field.type) {
    case "text":
    case "markdown":
      return <p className="whitespace-pre-wrap">{String(value)}</p>;

    case "json":
    case "code":
      return (
        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-[300px]">
          {JSON.stringify(value, null, 2)}
        </pre>
      );

    case "image":
      return (
        <img
          src={String(value)}
          alt={field.label}
          className="max-w-[200px] max-h-[200px] rounded-md object-cover"
        />
      );

    default:
      return renderCell({ value, field, record });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatNumber(value: unknown, field: FieldDefinition): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);

  if (field.type === "decimal") {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return num.toLocaleString();
}

function formatDate(value: unknown): string {
  try {
    const date = new Date(String(value));
    return format(date, "MMM d, yyyy");
  } catch {
    return String(value);
  }
}

function formatDateTime(value: unknown): string {
  try {
    const date = new Date(String(value));
    return format(date, "MMM d, yyyy h:mm a");
  } catch {
    return String(value);
  }
}

function renderSelectValue(
  value: unknown,
  options?: SelectOption[]
): React.ReactNode {
  const option = options?.find((o) => o.value === value);

  if (!option) {
    return <span>{String(value)}</span>;
  }

  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const colorClass = option.color ? colorMap[option.color] : colorMap.gray;

  return (
    <Badge variant="secondary" className={colorClass}>
      {option.label}
    </Badge>
  );
}

function renderMultiSelectValue(
  value: unknown,
  options?: SelectOption[]
): React.ReactNode {
  if (!Array.isArray(value)) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {value.map((v, i) => (
        <span key={i}>{renderSelectValue(v, options)}</span>
      ))}
    </div>
  );
}

function renderImage(value: unknown): React.ReactNode {
  if (!value) return null;

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={String(value)} />
      <AvatarFallback>
        <Hash className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
}

function renderRelation(
  value: unknown,
  field: FieldDefinition,
  record: Record<string, unknown>
): React.ReactNode {
  // Value might be the full relation object or just the ID
  if (typeof value === "object" && value !== null) {
    const displayField = field.relation?.displayField || "name";
    const displayValue = (value as Record<string, unknown>)[displayField];
    return <span>{String(displayValue || "—")}</span>;
  }

  // If we have the related object in the record
  const relationName = field.name.replace("Id", "");
  const relatedObject = record[relationName];
  if (typeof relatedObject === "object" && relatedObject !== null) {
    const displayField = field.relation?.displayField || "name";
    const displayValue = (relatedObject as Record<string, unknown>)[displayField];
    return <span>{String(displayValue || "—")}</span>;
  }

  return <span className="text-muted-foreground">{String(value)}</span>;
}

function renderTags(value: unknown): React.ReactNode {
  if (!value) return null;

  const tags = Array.isArray(value) ? value : String(value).split(",");

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag, i) => (
        <Badge key={i} variant="outline" className="text-xs">
          {String(tag).trim()}
        </Badge>
      ))}
      {tags.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  );
}

function renderColor(value: unknown): React.ReactNode {
  if (!value) return null;

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-5 w-5 rounded border"
        style={{ backgroundColor: String(value) }}
      />
      <span className="text-xs font-mono">{String(value)}</span>
    </div>
  );
}
