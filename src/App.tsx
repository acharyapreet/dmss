import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import WorkflowsPage from './pages/WorkflowsPage'
import CaseFilesPage from './pages/CaseFilesPage'
import AuditPage from './pages/AuditPage'
import ProfilePage from './pages/ProfilePage'
import AdminUsersPage from './pages/AdminUsersPage'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/case-files" element={<CaseFilesPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App