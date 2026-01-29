"use client"

import { cn } from "@/lib/utils"

type Status = "pending" | "approved" | "rejected" | "in-progress" | "draft" | "completed"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusStyles: Record<Status, string> = {
  pending: "bg-warning/10 text-warning-foreground border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  draft: "bg-muted text-muted-foreground border-border",
  completed: "bg-success/10 text-success border-success/20",
}

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  "in-progress": "In Progress",
  draft: "Draft",
  completed: "Completed",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
