"use client";

/**
 * ResourceList - Dynamic list view renderer
 *
 * Renders a data table based on resource configuration.
 */

import { useState } from "react";
import { useList } from "@refinedev/core";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Download,
  Pencil,
  Eye,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { ResourceConfig, FieldDefinition } from "@config/resources/types";
import { renderCell } from "./field-renderers";
import * as LucideIcons from "lucide-react";

interface ResourceListProps {
  config: ResourceConfig;
}

export function ResourceList({ config }: ResourceListProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.list.pageSize || 20);
  const [sortField, setSortField] = useState(config.list.defaultSort?.field || "");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    config.list.defaultSort?.order || "desc"
  );

  // Get visible columns from config
  const visibleFields = config.fields.filter(
    (f) => config.list.columns.includes(f.name)
  );

  // Build filters
  const filters = search && config.list.searchFields?.length
    ? config.list.searchFields.map((field) => ({
        field,
        operator: "contains" as const,
        value: search,
      }))
    : [];

  // Fetch data using Refine
  // Note: Pagination handled manually since Refine v4 doesn't accept pagination in useList
  const { query } = useList({
    resource: config.name,
    sorters: sortField
      ? [{ field: sortField, order: sortOrder }]
      : [],
    filters: filters.length > 0 ? [{ operator: "or", value: filters }] : [],
  });
  const data = query.data;
  const isLoading = query.isLoading;
  const isError = query.isError;

  const records = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Get icon component
  const getIcon = (iconName: string) => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const Icon = icons[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  // Get action icon
  const getActionIcon = (iconName?: string) => {
    if (!iconName) return null;
    switch (iconName) {
      case "Pencil":
        return <Pencil className="h-4 w-4" />;
      case "Eye":
        return <Eye className="h-4 w-4" />;
      case "Trash2":
        return <Trash2 className="h-4 w-4" />;
      case "Plus":
        return <Plus className="h-4 w-4" />;
      case "Download":
        return <Download className="h-4 w-4" />;
      default:
        return getIcon(iconName);
    }
  };

  // Replace template variables in URL
  const replaceVars = (template: string, record: Record<string, unknown>) => {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(record[key] || ""));
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-destructive">
            Error loading {config.labelPlural.toLowerCase()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.labelPlural}</h1>
          {config.description && (
            <p className="text-muted-foreground">{config.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {config.list.headerActions?.map((action) => (
            <Button
              key={action.name}
              variant={action.color === "primary" ? "default" : "outline"}
              size="sm"
              asChild={action.type === "link"}
            >
              {action.type === "link" ? (
                <Link href={action.href || "#"}>
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

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {config.list.searchable && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${config.labelPlural.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(config.list.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {visibleFields.map((field) => (
                <TableHead
                  key={field.name}
                  className={field.sortable !== false ? "cursor-pointer select-none" : ""}
                  onClick={() => field.sortable !== false && handleSort(field.name)}
                >
                  <div className="flex items-center gap-1">
                    {field.label}
                    {field.sortable !== false && (
                      <>
                        {sortField === field.name ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </>
                    )}
                  </div>
                </TableHead>
              ))}
              {config.list.rowActions && config.list.rowActions.length > 0 && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {visibleFields.map((field) => (
                    <TableCell key={field.name}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                  {config.list.rowActions && (
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : records.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={visibleFields.length + (config.list.rowActions ? 1 : 0)}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-medium">{config.list.emptyTitle || "No results"}</p>
                    <p className="text-sm text-muted-foreground">
                      {config.list.emptyDescription || "No records found."}
                    </p>
                    {config.list.emptyAction && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={config.list.emptyAction.href || "#"}>
                          {getActionIcon(config.list.emptyAction.icon)}
                          <span className="ml-2">{config.list.emptyAction.label}</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              records.map((record) => (
                <TableRow key={String(record.id)}>
                  {visibleFields.map((field) => (
                    <TableCell key={field.name}>
                      {renderCell({
                        value: record[field.name],
                        field,
                        record: record as Record<string, unknown>,
                      })}
                    </TableCell>
                  ))}
                  {config.list.rowActions && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {config.list.rowActions.map((action) => (
                          <Button
                            key={action.name}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild={action.type === "link"}
                            title={action.label}
                          >
                            {action.type === "link" ? (
                              <Link href={replaceVars(action.href || "#", record as Record<string, unknown>)}>
                                {getActionIcon(action.icon)}
                              </Link>
                            ) : (
                              getActionIcon(action.icon)
                            )}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, total)} of {total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
