import type { ReactNode } from "react";
import { Typography } from "./typography";

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "error" | "warning";
}

export function Card({
  title,
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const variantStyles = {
    default: "border",
    error: "border border-red-200 bg-red-50",
    warning: "border border-blue-200 bg-blue-50",
  };

  const titleColors = {
    default: "secondary" as const,
    error: "destructive" as const,
    warning: "primary" as const,
  };

  return (
    <section
      className={`rounded-lg p-6 ${variantStyles[variant]} ${className}`}
    >
      <Typography
        variant="xl/bold"
        color={titleColors[variant]}
        as="h2"
        className="mb-4"
      >
        {title}
      </Typography>
      {children}
    </section>
  );
}
