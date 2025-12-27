"use client";

/**
 * Admin Breadcrumbs Component
 *
 * Provides navigation context for admin pages.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { getResource } from "@config/resources";

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface AdminBreadcrumbsProps {
  items?: BreadcrumbItem[];
  resourceName?: string;
  recordId?: string;
  recordLabel?: string;
  action?: "create" | "edit" | "show";
}

export function AdminBreadcrumbs({
  items,
  resourceName,
  recordId,
  recordLabel,
  action,
}: AdminBreadcrumbsProps) {
  const pathname = usePathname();

  // If items are provided, use them directly
  if (items) {
    return <BreadcrumbList items={items} />;
  }

  // Otherwise, build breadcrumbs from resource context
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Admin", href: "/admin" },
  ];

  if (resourceName) {
    const resource = getResource(resourceName);
    const resourceLabel = resource?.labelPlural || resourceName;

    breadcrumbs.push({
      label: resourceLabel,
      href: `/admin/${resourceName}`,
    });

    if (action === "create") {
      breadcrumbs.push({
        label: "Create",
        href: pathname,
        current: true,
      });
    } else if (recordId) {
      const displayLabel = recordLabel || `#${recordId.slice(0, 8)}`;

      if (action === "edit") {
        breadcrumbs.push({
          label: displayLabel,
          href: `/admin/${resourceName}/${recordId}`,
        });
        breadcrumbs.push({
          label: "Edit",
          href: pathname,
          current: true,
        });
      } else {
        // Show view
        breadcrumbs.push({
          label: displayLabel,
          href: pathname,
          current: true,
        });
      }
    }
  }

  // Mark the last item as current if not already marked
  if (breadcrumbs.length > 0 && !breadcrumbs.some(b => b.current)) {
    breadcrumbs[breadcrumbs.length - 1].current = true;
  }

  return <BreadcrumbList items={breadcrumbs} />;
}

function BreadcrumbList({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-ltd-text-3 flex-shrink-0" />
            )}
            {item.current ? (
              <span className="font-medium text-ltd-text-1 truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "text-ltd-text-2 hover:text-ltd-primary transition-colors truncate max-w-[150px]",
                  index === 0 && "flex items-center gap-1"
                )}
              >
                {index === 0 && <Home className="h-3.5 w-3.5 flex-shrink-0" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Export a simpler hook-based approach for custom breadcrumbs
export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format the label
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    label = label.replace(/-/g, " ");

    // Check if this segment is a resource
    const resource = getResource(segment);
    if (resource) {
      label = resource.labelPlural;
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      current: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}
