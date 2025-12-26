/**
 * Refine Data Provider for Admin REST APIs
 *
 * This data provider connects Refine to our /api/admin/* endpoints.
 * It handles the Refine-specific query params format for pagination,
 * sorting, and filtering.
 */

import { DataProvider, BaseRecord } from "@refinedev/core";

const API_URL = "/api/admin";

/**
 * Build query string from Refine parameters
 */
function buildQueryString(params: {
  pagination?: { current?: number; pageSize?: number };
  sorters?: Array<{ field: string; order: "asc" | "desc" }>;
  filters?: Array<{
    field: string;
    operator: string;
    value: unknown;
  }>;
}): string {
  const searchParams = new URLSearchParams();

  // Pagination - convert to offset/limit format our APIs expect
  if (params.pagination) {
    const { current = 1, pageSize = 10 } = params.pagination;
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

  // Filters
  if (params.filters) {
    for (const filter of params.filters) {
      if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
        if (filter.field === "q") {
          // Search query
          searchParams.set("q", String(filter.value));
        } else {
          // Other filters - use field name directly
          searchParams.set(filter.field, String(filter.value));
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
  getList: async ({ resource, pagination, sorters, filters }) => {
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

  getOne: async ({ resource, id }) => {
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

  create: async ({ resource, variables }) => {
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

  update: async ({ resource, id, variables }) => {
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

  deleteOne: async ({ resource, id }) => {
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

  getMany: async ({ resource, ids }) => {
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
  custom: async ({ url, method, payload }) => {
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
} satisfies DataProvider;
