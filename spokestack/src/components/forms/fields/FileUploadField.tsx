"use client";

import { useState } from "react";
import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";
import { Upload, X, File } from "lucide-react";

interface FileUploadFieldProps {
  field: FormField;
  value: File[];
  onChange: (value: File[]) => void;
  error?: string;
}

export function FileUploadField({ field, value = [], onChange, error }: FileUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (field.multiple) {
      onChange([...value, ...files]);
    } else {
      onChange(files.slice(0, 1));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (field.multiple) {
      onChange([...value, ...files]);
    } else {
      onChange(files.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-[#52EDC7] bg-[#52EDC7]/5" : "border-gray-300 hover:border-gray-400",
          error && "border-red-500"
        )}
      >
        <input
          type="file"
          onChange={handleFileChange}
          multiple={field.multiple}
          accept={field.accept?.join(",")}
          className="hidden"
          id={`file-${field.id}`}
        />
        <label htmlFor={`file-${field.id}`} className="cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Drag and drop files here, or{" "}
            <span className="text-[#52EDC7] font-medium">browse</span>
          </p>
          {field.accept && (
            <p className="text-xs text-gray-400 mt-1">
              Accepted: {field.accept.join(", ")}
            </p>
          )}
        </label>
      </div>

      {value.length > 0 && (
        <div className="space-y-2 mt-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <File className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 flex-1 truncate">
                {file.name}
              </span>
              <span className="text-xs text-gray-400">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
