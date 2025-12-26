"use client";

/**
 * ResourceShow - Dynamic detail view renderer
 *
 * Renders a detail view based on resource configuration.
 */

import { useOne } from "@refinedev/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { ResourceConfig, FieldDefinition, ShowSection } from "@config/resources/types";
import { renderShowField } from "./field-renderers";

interface ResourceShowProps {
  config: ResourceConfig;
  id: string;
}

export function ResourceShow({ config, id }: ResourceShowProps) {
  const { query } = useOne({
    resource: config.name,
    id,
  });
  const data = query.data;
  const isLoading = query.isLoading;
  const isError = query.isError;

  const record = data?.data as Record<string, unknown> | undefined;
  const showView = config.show;

  if (!showView) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            Detail view is not configured for this resource.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get field definition by name
  const getField = (name: string): FieldDefinition | undefined => {
    return config.fields.find((f) => f.name === name);
  };

  // Get action icon
  const getActionIcon = (iconName?: string) => {
    switch (iconName) {
      case "Pencil":
        return <Pencil className="h-4 w-4" />;
      case "Trash2":
        return <Trash2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Replace template variables in URL
  const replaceVars = (template: string, data: Record<string, unknown>) => {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] || ""));
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-destructive">
            Error loading {config.label.toLowerCase()}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!record) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            {config.label} not found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get display name from record
  const displayName = (record.name || record.title || record.email || id) as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/${config.name}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">{config.label} Details</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showView.actions?.map((action) => (
            <Button
              key={action.name}
              variant={action.color === "primary" ? "default" : action.color === "danger" ? "destructive" : "outline"}
              size="sm"
              asChild={action.type === "link"}
            >
              {action.type === "link" ? (
                <Link href={replaceVars(action.href || "#", record)}>
                  {getActionIcon(action.icon)}
                  <span className="ml-2">{action.label}</span>
                </Link>
              ) : (
                <>
                  {getActionIcon(action.icon)}
                  <span className="ml-2">{action.label}</span>
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {showView.layout === "tabs" ? (
        <Tabs defaultValue={showView.sections[0]?.id}>
          <TabsList>
            {showView.sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {showView.sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <SectionCard
                section={section}
                record={record}
                getField={getField}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className={`grid gap-6 ${showView.layout === "two-column" ? "lg:grid-cols-2" : ""}`}>
          {showView.sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              record={record}
              getField={getField}
            />
          ))}
        </div>
      )}

      {/* Related Resources */}
      {showView.related && showView.related.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Related</h2>
          {showView.related.map((related) => (
            <Card key={related.resource}>
              <CardHeader>
                <CardTitle className="text-base">{related.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Related {related.resource} will be displayed here.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SECTION CARD COMPONENT
// ============================================

interface SectionCardProps {
  section: ShowSection;
  record: Record<string, unknown>;
  getField: (name: string) => FieldDefinition | undefined;
}

function SectionCard({ section, record, getField }: SectionCardProps) {
  const sectionFields = section.fields
    .map((name) => {
      const field = getField(name);
      if (!field) return null;
      return { field, value: record[name] };
    })
    .filter((f): f is { field: FieldDefinition; value: unknown } => !!f);

  const gridCols = section.columns || 2;
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[gridCols];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${gridClass}`}>
          {sectionFields.map(({ field, value }) => (
            <div key={field.name}>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                {field.label}
              </dt>
              <dd className="text-sm">
                {renderShowField({ value, field, record })}
              </dd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
