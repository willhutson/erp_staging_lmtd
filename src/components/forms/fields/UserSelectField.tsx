"use client";

import { useState } from "react";
import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface UserSelectFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  users: User[];
}

export function UserSelectField({ field, value, onChange, error, users }: UserSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter users based on field filter and search
  const filteredUsers = users.filter((user) => {
    // Apply department filter if specified
    if (field.filter?.departments && field.filter.departments.length > 0) {
      if (!field.filter.departments.includes(user.department)) {
        return false;
      }
    }
    // Apply search filter
    if (search) {
      return user.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const selectedUser = users.find((u) => u.id === value);

  return (
    <div className="space-y-1 relative">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent bg-white text-left flex items-center justify-between",
          error ? "border-red-500" : "border-gray-300"
        )}
      >
        {selectedUser ? (
          <span>{selectedUser.name}</span>
        ) : (
          <span className="text-gray-400">{field.placeholder || "Select a user"}</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="p-3 text-sm text-gray-500 text-center">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    onChange(user.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-50",
                    user.id === value && "bg-[#52EDC7]/10"
                  )}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
