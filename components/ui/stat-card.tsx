"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center",
            iconClassName || "bg-primary/10"
          )}
        >
          <Icon className={cn("h-5 w-5", iconClassName ? "text-current" : "text-primary")} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p
            className={cn(
              "text-xs mt-1 flex items-center gap-1",
              trend.isPositive ? "text-success" : "text-destructive"
            )}
          >
            <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
            <span className="text-muted-foreground">from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
