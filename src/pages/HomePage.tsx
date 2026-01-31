import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { Navigate } from "react-router-dom"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LoginForm />
}