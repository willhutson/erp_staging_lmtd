"use client";

/**
 * Dynamic Resource Create Page
 *
 * Renders a create form for any registered resource.
 */

import { notFound } from "next/navigation";
import { getResource } from "@config/resources";
import { ResourceForm } from "@/components/admin/resource-renderer";

interface ResourceCreatePageProps {
  params: {
    resource: string;
  };
}

export default function ResourceCreatePage({ params }: ResourceCreatePageProps) {
  const config = getResource(params.resource);

  if (!config) {
    notFound();
  }

  return <ResourceForm config={config} mode="create" />;
}
