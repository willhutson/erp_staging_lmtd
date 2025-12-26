/**
 * Refine Data Provider for Admin REST APIs
 *
 * This data provider connects Refine to our /api/admin/* endpoints.
 * It handles the Refine-specific query params format for pagination,
 * sorting, and filtering.
 */

import {
  DataProvider,
  BaseRecord,
  GetListParams,
  GetOneParams,
  CreateParams,
  UpdateParams,
  DeleteOneParams,
  GetManyParams,
  CustomParams,
  CrudFilter,
  CrudSort,
  Pagination,
  LogicalFilter,
} from "@refinedev/core";

const API_URL = "/api/admin";

/**
 * Build query string from Refine parameters
 */
function buildQueryString(params: {
  pagination?: Pagination;
  sorters?: CrudSort[];
  filters?: CrudFilter[];
}): string {
  const searchParams = new URLSearchParams();

  // Pagination - convert to offset/limit format our APIs expect
  // Cast pagination to expected shape since Refine's Pagination type varies
  if (params.pagination) {
    const pag = params.pagination as { current?: number; pageSize?: number };
    const current = pag.current ?? 1;
    const pageSize = pag.pageSize ?? 10;
    const offset = (current - 1) * pageSize;
    searchParams.set("_start", offset.toString());
    searchParams.set("_end", (offset + pageSize).toString());
  }

  // Sorting
  if (params.sorters && params.sorters.length > 0) {
    const sorter = params.sorters[0]; // Use first sorter
    searchParams.set("_sort", sorter.field);
    searchParams.set("_order", sorter.order);
  }

  // Filters - only handle LogicalFilter (has 'field' property)
  if (params.filters) {
    for (const filter of params.filters) {
      // Skip ConditionalFilter (has 'key' instead of 'field')
      if (!("field" in filter)) continue;

      const logicalFilter = filter as LogicalFilter;
      if (logicalFilter.value !== undefined && logicalFilter.value !== null && logicalFilter.value !== "") {
        if (logicalFilter.field === "q") {
          // Search query
          searchParams.set("q", String(logicalFilter.value));
        } else {
          // Other filters - use field name directly
          searchParams.set(logicalFilter.field, String(logicalFilter.value));
        }
      }
    }
  }

  return searchParams.toString();
}

/**
 * Parse API response to extract data and total
 */
interface ApiResponse<T> {
  success: boolean;
  data: T | T[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  error?: string;
}

export const dataProvider = {
  getList: async ({ resource, pagination, sorters, filters }: GetListParams) => {
    const query = buildQueryString({ pagination, sorters, filters });
    const url = `${API_URL}/${resource}${query ? `?${query}` : ""}`;

    const response = await fetch(url);
    const json: ApiResponse<unknown[]> = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Failed to fetch data");
    }

    return {
      data: json.data as BaseRecord[],
      total: json.pagination?.total || (json.data as BaseRecord[]).length,
    };
  },

  getOne: async ({ resource, id }: GetOneParams) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url);
    const json: ApiResponse<unknown> = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Resource not found");
    }

    return {
      data: json.data as BaseRecord,
    };
  },

  create: async ({ resource, variables }: CreateParams) => {
    const url = `${API_URL}/${resource}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables),
    });
    const json: ApiResponse<unknown> = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Failed to create resource");
    }

    return {
      data: json.data as BaseRecord,
    };
  },

  update: async ({ resource, id, variables }: UpdateParams) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables),
    });
    const json: ApiResponse<unknown> = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Failed to update resource");
    }

    return {
      data: json.data as BaseRecord,
    };
  },

  deleteOne: async ({ resource, id }: DeleteOneParams) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });
    const json: ApiResponse<unknown> = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Failed to delete resource");
    }

    return {
      data: json.data as BaseRecord,
    };
  },

  getMany: async ({ resource, ids }: GetManyParams) => {
    // Fetch each resource individually (our API doesn't support bulk get)
    const promises = ids.map(async (id) => {
      const url = `${API_URL}/${resource}/${id}`;
      const response = await fetch(url);
      const json: ApiResponse<unknown> = await response.json();
      if (!json.success) {
        throw new Error(json.error);
      }
      return json.data;
    });

    const data = await Promise.all(promises);
    return { data: data as BaseRecord[] };
  },

  getApiUrl: () => API_URL,

  // Custom method for policy actions (submit, approve, reject, etc.)
  custom: async ({ url, method, payload }: CustomParams) => {
    const response = await fetch(url, {
      method: method?.toUpperCase() || "POST",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const json: ApiResponse<unknown> = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Request failed");
    }

    return { data: json.data as BaseRecord };
  },
} as unknown as DataProvider;
