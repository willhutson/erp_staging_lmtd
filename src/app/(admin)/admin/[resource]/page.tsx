"use client";

/**
 * Dynamic Resource List Page
 *
 * Renders a list view for any registered resource.
 */

import { notFound } from "next/navigation";
import { getResource } from "@config/resources";
import { ResourceList } from "@/components/admin/resource-renderer";

interface ResourceListPageProps {
  params: {
    resource: string;
  };
}

export default function ResourceListPage({ params }: ResourceListPageProps) {
  const config = getResource(params.resource);

  if (!config) {
    notFound();
  }

  return <ResourceList config={config} />;
}
