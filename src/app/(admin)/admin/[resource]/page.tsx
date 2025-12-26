"use client";

/**
 * Dynamic Resource List Page
 *
 * Renders a list view for any registered resource.
 */

import { getResource } from "@config/resources";
import { ResourceList } from "@/components/admin/resource-renderer";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

interface ResourceListPageProps {
  params: Promise<{
    resource: string;
  }>;
}

export default function ResourceListPage({ params }: ResourceListPageProps) {
  const { resource } = use(params);
  const config = getResource(resource);

  if (!config) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Resource Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The resource &quot;{resource}&quot; is not registered.
            </p>
            <Button variant="outline" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ResourceList config={config} />;
}
