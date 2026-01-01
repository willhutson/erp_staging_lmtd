"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface StudioCardProps {
  href: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  status?: {
    label: string;
    color: "green" | "yellow" | "red" | "blue" | "gray";
  };
  metadata?: {
    label: string;
    value: string;
  }[];
  updatedAt?: Date;
  thumbnail?: string;
  className?: string;
}

const statusColors = {
  green: "bg-green-500/10 text-green-600 border-green-500/20",
  yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  red: "bg-red-500/10 text-red-600 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  gray: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function StudioCard({
  href,
  title,
  subtitle,
  description,
  icon,
  iconColor = "from-ltd-primary to-[#7B61FF]",
  status,
  metadata,
  updatedAt,
  thumbnail,
  className,
}: StudioCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block p-4 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50 hover:shadow-lg transition-all",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail or Icon */}
        {thumbnail ? (
          <div className="w-16 h-16 rounded-[var(--ltd-radius-md)] overflow-hidden bg-ltd-surface-3 flex-shrink-0">
            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
        ) : icon ? (
          <div
            className={cn(
              "w-12 h-12 rounded-[var(--ltd-radius-md)] flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
              iconColor
            )}
          >
            {icon}
          </div>
        ) : null}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-ltd-text-1 truncate group-hover:text-ltd-primary transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-ltd-text-2 truncate">{subtitle}</p>
              )}
            </div>
            {status && (
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full border",
                  statusColors[status.color]
                )}
              >
                {status.label}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-2 text-sm text-ltd-text-2 line-clamp-2">
              {description}
            </p>
          )}

          {/* Metadata */}
          {(metadata || updatedAt) && (
            <div className="mt-3 flex items-center gap-4 text-xs text-ltd-text-3">
              {metadata?.map((item, index) => (
                <span key={index}>
                  {item.label}: <span className="text-ltd-text-2">{item.value}</span>
                </span>
              ))}
              {updatedAt && (
                <span>
                  Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
