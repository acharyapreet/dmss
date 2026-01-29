"use client"

import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { ManagerDashboard } from "@/components/dashboards/manager-dashboard"
import { UserDashboard } from "@/components/dashboards/user-dashboard"
import { LoginForm } from "@/components/login-form"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {user?.role === "admin" && <AdminDashboard />}
        {user?.role === "manager" && <ManagerDashboard />}
        {user?.role === "user" && <UserDashboard />}
      </main>
    </div>
  )
}
