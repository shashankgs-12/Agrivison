import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({
  src,
  alt = "User Avatar",
  fallback = "U",
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-emerald-100 text-emerald-800 font-semibold items-center justify-center border border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700",
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
