"use client";

/**
 * RelationPicker - Autocomplete relation field component
 *
 * Provides searchable dropdown for selecting related records.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useList } from "@refinedev/core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Check,
  ChevronsUpDown,
  X,
  Search,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldDefinition } from "@config/resources/types";

interface RelationPickerProps {
  field: FieldDefinition;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

interface RelatedRecord {
  id: string;
  [key: string]: unknown;
}

export function RelationPicker({
  field,
  value,
  onChange,
  disabled,
}: RelationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Get relation config
  const relationConfig = field.relation;
  const resource = relationConfig?.resource || field.name.replace("Id", "s");
  const displayField = relationConfig?.displayField || "name";
  const searchFields = relationConfig?.searchFields || [displayField];

  // Fetch related records
  const { query } = useList<RelatedRecord>({
    resource,
    pagination: { current: 1, pageSize: 20 },
    filters: debouncedSearch
      ? [
          {
            field: searchFields[0],
            operator: "contains",
            value: debouncedSearch,
          },
        ]
      : [],
    queryOptions: {
      enabled: open || !!value,
    },
  });

  const data = query.data;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const records = data?.data || [];

  // Fetch selected record if value exists but not in current list
  const { query: selectedQuery } = useList<RelatedRecord>({
    resource,
    filters: value ? [{ field: "id", operator: "eq", value }] : [],
    pagination: { current: 1, pageSize: 1 },
    queryOptions: {
      enabled: !!value && !records.find((r) => r.id === value),
    },
  });

  // Find the selected record
  const selectedRecord =
    records.find((r) => r.id === value) || selectedQuery.data?.data?.[0];

  // Get display value for a record
  const getDisplayValue = (record: RelatedRecord): string => {
    if (!record) return "";

    // Try main display field
    const mainValue = record[displayField];
    if (mainValue) return String(mainValue);

    // Fallback to common fields
    for (const fallback of ["name", "title", "label", "email"]) {
      if (record[fallback]) return String(record[fallback]);
    }

    return record.id;
  };

  // Get secondary display value (for additional context)
  const getSecondaryValue = (record: RelatedRecord): string | null => {
    const secondaryField = relationConfig?.secondaryField;
    if (secondaryField && record[secondaryField]) {
      return String(record[secondaryField]);
    }
    return null;
  };

  const handleSelect = (recordId: string) => {
    onChange(recordId === value ? null : recordId);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-10 font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 flex-1 truncate">
            {value && selectedRecord ? (
              <>
                <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{getDisplayValue(selectedRecord)}</span>
                {getSecondaryValue(selectedRecord) && (
                  <Badge variant="secondary" className="text-[10px] ml-1 shrink-0">
                    {getSecondaryValue(selectedRecord)}
                  </Badge>
                )}
              </>
            ) : (
              <span>Select {field.label.toLowerCase()}...</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {value && (
              <X
                className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder={`Search ${field.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>

          <CommandList>
            {isError ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Failed to load {field.label.toLowerCase()}
              </div>
            ) : isLoading && records.length === 0 ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : records.length === 0 ? (
              <CommandEmpty>
                No {field.label.toLowerCase()} found
                {search && ` for "${search}"`}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {records.map((record) => {
                    const isSelected = record.id === value;
                    const displayValue = getDisplayValue(record);
                    const secondaryValue = getSecondaryValue(record);

                    return (
                      <CommandItem
                        key={record.id}
                        value={record.id}
                        onSelect={() => handleSelect(record.id)}
                        className="flex items-center gap-3 py-2.5 px-3 cursor-pointer"
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-medium",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30 bg-muted text-muted-foreground"
                          )}
                        >
                          {displayValue.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {displayValue}
                          </div>
                          {secondaryValue && (
                            <div className="text-xs text-muted-foreground truncate">
                              {secondaryValue}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>
            )}
          </CommandList>

          {/* Footer with record count */}
          {records.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              Showing {records.length} of {data?.total || records.length}{" "}
              {field.label.toLowerCase()}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Multi-select version for hasMany relations
interface MultiRelationPickerProps {
  field: FieldDefinition;
  value: string[] | null | undefined;
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function MultiRelationPicker({
  field,
  value = [],
  onChange,
  disabled,
}: MultiRelationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const selectedIds = value || [];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Get relation config
  const relationConfig = field.relation;
  const resource = relationConfig?.resource || field.name.replace("Ids", "s");
  const displayField = relationConfig?.displayField || "name";
  const searchFields = relationConfig?.searchFields || [displayField];

  // Fetch related records
  const { query: multiQuery } = useList<RelatedRecord>({
    resource,
    pagination: { current: 1, pageSize: 50 },
    filters: debouncedSearch
      ? [
          {
            field: searchFields[0],
            operator: "contains",
            value: debouncedSearch,
          },
        ]
      : [],
    queryOptions: {
      enabled: open || selectedIds.length > 0,
    },
  });

  const isLoading = multiQuery.isLoading;
  const isError = multiQuery.isError;
  const records = multiQuery.data?.data || [];

  const getDisplayValue = (record: RelatedRecord): string => {
    const mainValue = record[displayField];
    if (mainValue) return String(mainValue);
    return record.id;
  };

  const handleToggle = (recordId: string) => {
    if (selectedIds.includes(recordId)) {
      onChange(selectedIds.filter((id) => id !== recordId));
    } else {
      onChange([...selectedIds, recordId]);
    }
  };

  const handleRemove = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== recordId));
  };

  const selectedRecords = records.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-2">
      {/* Selected items */}
      {selectedRecords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedRecords.map((record) => (
            <Badge
              key={record.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {getDisplayValue(record)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={(e) => handleRemove(record.id, e)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Picker trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-10"
          >
            <span className="text-muted-foreground">
              Add {field.label.toLowerCase()}...
            </span>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder={`Search ${field.label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
              )}
            </div>

            <CommandList>
              {isError ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Failed to load {field.label.toLowerCase()}
                </div>
              ) : records.length === 0 && !isLoading ? (
                <CommandEmpty>
                  No {field.label.toLowerCase()} found
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {records.map((record) => {
                      const isSelected = selectedIds.includes(record.id);

                      return (
                        <CommandItem
                          key={record.id}
                          value={record.id}
                          onSelect={() => handleToggle(record.id)}
                          className="flex items-center gap-3 py-2.5 px-3 cursor-pointer"
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span className="flex-1 truncate">
                            {getDisplayValue(record)}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </ScrollArea>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
