import type { ReactNode } from "react";

interface DescriptionListProps {
  children: ReactNode;
  className?: string;
}

interface DescriptionListItemProps {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}

export function DescriptionList({
  children,
  className = "space-y-3",
}: DescriptionListProps) {
  return <dl className={className}>{children}</dl>;
}

export function DescriptionListItem({
  label,
  value,
  mono = false,
  className = "",
}: DescriptionListItemProps) {
  return (
    <div className={className}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
