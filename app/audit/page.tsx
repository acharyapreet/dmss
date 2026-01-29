"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  FileText,
  GitBranch,
  FolderOpen,
  User,
  Calendar,
  Clock,
  RefreshCw,
  Activity,
  Shield,
  AlertTriangle,
} from "lucide-react"
import { useSearchParams } from "next/navigation"

const actionTypes = ["All Actions", "Document Created", "Document Updated", "Document Downloaded", "Document Rejected", "Workflow Started", "Workflow Approved", "Workflow Rejected", "Case File Created", "Case File Archived", "User Role Updated", "Login Failed", "Permission Denied"]
const resourceTypes = ["All Resources", "document", "workflow", "case-file", "user", "auth", "system"]
const statusTypes = ["All Status", "success", "warning", "error"]

export default function AuditPage() {
  const { isAuthenticated, user, token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("All Actions")
  const [resourceFilter, setResourceFilter] = useState("All Resources")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()

  // Fetch audit logs from API
  const fetchAuditLogs = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      console.log('🔍 Fetching audit logs...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/audit`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('📥 Audit response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Audit response data:', data)
        setAuditLogs(data.data?.auditLogs || data.data || [])
      } else {
        console.error('❌ Failed to fetch audit logs:', response.status)
      }
    } catch (error) {
      console.error('❌ Audit logs error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchAuditLogs()
    }
  }, [isAuthenticated, token])

  // Handle refresh
  const handleRefresh = () => {
    fetchAuditLogs()
  }

  // Handle export logs
  const handleExportLogs = () => {
    try {
      const csvContent = [
        ['Timestamp', 'Action', 'Resource Type', 'Resource', 'User', 'Status', 'IP Address'].join(','),
        ...filteredLogs.map(log => [
          log.timestamp || new Date(log.createdAt).toLocaleString(),
          log.action,
          log.resourceType,
          log.resource || log.details || '',
          log.user || 'Unknown',
          log.status || 'unknown',
          log.ip || 'N/A'
        ].map(field => `"${field}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert('Audit logs exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export logs')
    }
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading audit logs...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const filteredLogs = auditLogs.filter((log: any) => {
    const matchesSearch = (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.resource || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = actionFilter === "All Actions" || log.action === actionFilter
    const matchesResource = resourceFilter === "All Resources" || log.resourceType === resourceFilter
    const matchesStatus = statusFilter === "All Status" || log.status === statusFilter
    return matchesSearch && matchesAction && matchesResource && matchesStatus
  })

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-4 h-4" />
      case "workflow":
        return <GitBranch className="w-4 h-4" />
      case "case-file":
        return <FolderOpen className="w-4 h-4" />
      case "user":
        return <User className="w-4 h-4" />
      case "auth":
        return <Shield className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success"
      case "warning":
        return "bg-warning/10 text-warning-foreground"
      case "error":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Audit & Traceability</h1>
              <p className="text-muted-foreground">Monitor system activity and track changes</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{auditLogs.length}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{auditLogs.filter((l: any) => (l.status || 'success') === "success").length}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{auditLogs.filter((l: any) => (l.status || 'success') === "warning").length}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{auditLogs.filter((l: any) => (l.status || 'success') === "error").length}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={resourceFilter} onValueChange={setResourceFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((resource) => (
                        <SelectItem key={resource} value={resource}>
                          {resource === "All Resources" ? resource : resource.charAt(0).toUpperCase() + resource.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusTypes.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "All Status" ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Logs</CardTitle>
              <CardDescription>
                {filteredLogs.length} event{filteredLogs.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Action</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Resource</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">User</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4 hidden lg:table-cell">Timestamp</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4 hidden xl:table-cell">IP Address</th>
                      <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log: any) => (
                      <tr key={log.id || log._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getStatusColor(log.status || 'success')}`}>
                              {getResourceIcon(log.resourceType || 'system')}
                            </div>
                            <span className="text-sm font-medium text-foreground">{log.action || 'Unknown Action'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-foreground">{log.resource || log.details || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground capitalize">{(log.resourceType || 'system').replace("-", " ")}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-foreground">{log.user || 'System'}</p>
                              <p className="text-xs text-muted-foreground">{log.role || 'system'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {log.timestamp || new Date(log.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden xl:table-cell">
                          <span className="text-sm font-mono text-muted-foreground">{log.ip || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status || 'success')}`}>
                            {(log.status || 'success').charAt(0).toUpperCase() + (log.status || 'success').slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


