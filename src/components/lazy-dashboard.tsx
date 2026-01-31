"use client"

import { lazy, Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SkeletonStats, SkeletonCard } from "@/components/ui/skeleton-card"

// Lazy load dashboard components
const AdminDashboard = lazy(() => import("@/components/dashboards/admin-dashboard").then(module => ({ default: module.AdminDashboard })))
const ManagerDashboard = lazy(() => import("@/components/dashboards/manager-dashboard").then(module => ({ default: module.ManagerDashboard })))
const UserDashboard = lazy(() => import("@/components/dashboards/user-dashboard").then(module => ({ default: module.UserDashboard })))

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
    <SkeletonStats />
    <div className="grid gap-6 lg:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <SkeletonCard />
  </div>
)

export function LazyDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const DashboardComponent = user.role === 'admin' ? AdminDashboard : 
                           user.role === 'manager' ? ManagerDashboard : 
                           UserDashboard

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardComponent />
    </Suspense>
  )
}