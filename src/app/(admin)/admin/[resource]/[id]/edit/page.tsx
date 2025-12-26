"use client";

/**
 * Dynamic Resource Edit Page
 *
 * Renders an edit form for any registered resource.
 */

import { notFound } from "next/navigation";
import { getResource } from "@config/resources";
import { ResourceForm } from "@/components/admin/resource-renderer";

interface ResourceEditPageProps {
  params: {
    resource: string;
    id: string;
  };
}

export default function ResourceEditPage({ params }: ResourceEditPageProps) {
  const config = getResource(params.resource);

  if (!config) {
    notFound();
  }

  return <ResourceForm config={config} mode="edit" id={params.id} />;
}
