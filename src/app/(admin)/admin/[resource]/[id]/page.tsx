"use client";

/**
 * Dynamic Resource Show Page
 *
 * Renders a detail view for any registered resource.
 */

import { notFound } from "next/navigation";
import { getResource } from "@config/resources";
import { ResourceShow } from "@/components/admin/resource-renderer";

interface ResourceShowPageProps {
  params: {
    resource: string;
    id: string;
  };
}

export default function ResourceShowPage({ params }: ResourceShowPageProps) {
  const config = getResource(params.resource);

  if (!config) {
    notFound();
  }

  return <ResourceShow config={config} id={params.id} />;
}
