import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { StatCard } from "../../components/ui/stat-card"
import { StatusBadge } from "../../components/ui/status-badge"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Progress } from "../../components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Users,
  FileText,
  GitBranch,
  ClipboardList,
  Shield,
  UserPlus,
  Settings,
  ArrowUpRight,
  MoreHorizontal,
  Edit,
  UserX,
  UserCheck,
  Eye,
} from "lucide-react"

export function AdminDashboard() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [caseFiles, setCaseFiles] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [addUserForm, setAddUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    position: ''
  })
  const [editUserForm, setEditUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    department: '',
    position: '',
    isActive: true
  })
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false)
  const [createDocumentForm, setCreateDocumentForm] = useState({
    title: '',
    type: '',
    description: ''
  })
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        return
      }
      
      try {
        // Make all API calls in parallel for better performance
        const [statsResponse, usersResponse, activitiesResponse, caseFilesResponse, documentsResponse, workflowsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/dashboard/users?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/dashboard/activities?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files?status=open&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/documents?status=pending&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/workflows?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])
        
        // Process responses
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data?.stats || {})
        } else {
          setStats({})
        }

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(Array.isArray(usersData.data?.users) ? usersData.data.users : [])
        } else {
          setUsers([])
        }

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(Array.isArray(activitiesData.data?.activities) ? activitiesData.data.activities : [])
        } else {
          setActivities([])
        }

        if (caseFilesResponse.ok) {
          const caseFilesData = await caseFilesResponse.json()
          setCaseFiles(Array.isArray(caseFilesData.data?.caseFiles) ? caseFilesData.data.caseFiles : [])
        } else {
          setCaseFiles([])
        }

        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json()
          setDocuments(Array.isArray(documentsData.data?.documents) ? documentsData.data.documents : [])
        } else {
          setDocuments([])
        }

        if (workflowsResponse.ok) {
          const workflowsData = await workflowsResponse.json()
          setWorkflows(Array.isArray(workflowsData.data?.workflows) ? workflowsData.data.workflows : [])
        } else {
          setWorkflows([])
        }
      } catch (error) {
        // Set safe defaults on error
        setStats({})
        setUsers([])
        setActivities([])
        setCaseFiles([])
        setDocuments([])
        setWorkflows([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  // Handle add user
  const handleAddUser = async () => {
    if (!token) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addUserForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUsers(prev => [data.data.user, ...prev])
        setIsAddUserDialogOpen(false)
        setAddUserForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'user',
          department: '',
          position: ''
        })
        alert('User added successfully!')
        // Refresh stats
        const statsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data?.stats || {})
        }
      } else {
        alert(`Failed to add user: ${data.message}`)
      }
    } catch (error) {
      alert('Failed to add user')
    }
  }

  // Handle edit user
  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setEditUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'user',
      department: user.department || '',
      position: user.position || '',
      isActive: user.isActive !== false
    })
    setIsEditUserDialogOpen(true)
  }

  // Handle update user
  const handleUpdateUser = async () => {
    if (!token || !selectedUser) return
    
    try {
      const updatePayload = {
        ...editUserForm,
        fullName: `${editUserForm.firstName} ${editUserForm.lastName}`
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? data.data.user : u))
        setIsEditUserDialogOpen(false)
        setSelectedUser(null)
        alert('User updated successfully!')
      } else {
        alert(`Failed to update user: ${data.message}`)
      }
    } catch (error) {
      alert('Failed to update user')
    }
  }

  // Handle toggle user status
  const handleToggleUserStatus = async (user: any) => {
    if (!token) return
    
    const newStatus = !user.isActive
    const action = newStatus ? 'activate' : 'deactivate'
    
    if (!confirm(`Are you sure you want to ${action} ${user.fullName || user.email}?`)) {
      return
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: newStatus
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUsers(prev => prev.map(u => u._id === user._id ? data.data.user : u))
        alert(`User ${action}d successfully!`)
      } else {
        alert(`Failed to ${action} user: ${data.message}`)
      }
    } catch (error) {
      alert(`Failed to ${action} user`)
    }
  }

  // Handle document creation
  const handleCreateDocument = async () => {
    if (!token) return
    
    if (!createDocumentForm.title || !createDocumentForm.type) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createDocumentForm)
      })
      
      if (response.ok) {
        const data = await response.json()
        setCreateDocumentForm({ title: '', type: '', description: '' })
        setIsCreateDocumentOpen(false)
        alert('Document created successfully!')
      } else {
        const data = await response.json()
        alert(`Failed to create document: ${data.message}`)
      }
    } catch (error) {
      alert('Failed to create document')
    }
  }

  // Handle case file actions
  const handleCaseFileAction = async (caseFile: any, action: 'approve' | 'reject') => {
    if (!token) return
    
    const confirmed = confirm(`Are you sure you want to ${action} case file "${caseFile.title}"?`)
    if (!confirmed) return
    
    try {
      // Map actions to correct case file statuses
      const newStatus = action === 'approve' ? 'in-progress' : 'closed';
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files/${caseFile._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      })
      
      if (response.ok) {
        setCaseFiles(prev => prev.filter(cf => cf._id !== caseFile._id))
        alert(`Case file ${action}d successfully! Status changed to ${newStatus}.`)
      } else {
        const data = await response.json()
        alert(`Failed to ${action} case file: ${data.message}`)
      }
    } catch (error) {
      console.error(`❌ Failed to ${action} case file:`, error)
      alert(`Failed to ${action} case file`)
    }
  }

  // Handle document actions (approve/reject)
  const handleDocumentAction = async (document: any, action: 'approve' | 'reject') => {
    if (!token) {
      alert('Authentication token not found. Please log in again.')
      return
    }
    
    const confirmed = confirm(`Are you sure you want to ${action} document "${document.title}"?`)
    if (!confirmed) {
      return
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/documents/${document._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setDocuments(prev => prev.filter(d => d._id !== document._id))
        alert(`Document "${document.title}" ${action}d successfully!`)
      } else {
        const data = await response.json()
        alert(`Failed to ${action} document: ${data.message}`)
      }
    } catch (error) {
      alert(`Failed to ${action} document: ${error.message}`)
    }
  }

  // Handle view document details
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document)
    setIsViewDocumentOpen(true)
  }

  // Handle workflow actions
  const handleWorkflowAction = async (workflow: any, action: 'advance' | 'back' | 'cancel' | 'delete') => {
    if (!token) {
      alert('Authentication token not found. Please log in again.')
      return
    }
    
    const confirmed = confirm(`Are you sure you want to ${action} workflow "${workflow.name}"?`)
    if (!confirmed) {
      return
    }
    
    try {
      let endpoint = ''
      let method = 'PUT'
      let body = {}
      
      switch (action) {
        case 'advance':
          endpoint = `/workflows/${workflow._id}/advance`
          break
        case 'back':
          endpoint = `/workflows/${workflow._id}/backward`
          break
        case 'cancel':
          endpoint = `/workflows/${workflow._id}`
          body = { status: 'cancelled' }
          break
        case 'delete':
          endpoint = `/workflows/${workflow._id}`
          method = 'DELETE'
          break
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}${endpoint}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method === 'DELETE' ? undefined : JSON.stringify(body)
      })
      
      if (response.ok) {
        const data = await response.json()
        const updatedWorkflow = data.data?.workflow || data.data
        
        if (action === 'cancel' || action === 'delete') {
          setWorkflows(prev => prev.filter(w => w._id !== workflow._id))
        } else {
          setWorkflows(prev => prev.map(w => w._id === workflow._id ? updatedWorkflow : w))
        }
        
        alert(`Workflow "${workflow.name}" ${action}d successfully!`)
      } else {
        const data = await response.json()
        alert(`Failed to ${action} workflow: ${data.message}`)
      }
    } catch (error) {
      alert(`Failed to ${action} workflow: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDocumentOpen} onOpenChange={setIsCreateDocumentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toString() || "0"}
          description="Active system users"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Documents"
          value={stats?.totalDocuments?.toString() || "0"}
          description="Total documents in system"
          icon={FileText}
          trend={{ value: 8, isPositive: true }}
          iconClassName="bg-accent/10 text-accent"
        />
        <StatCard
          title="Active Workflows"
          value={stats?.activeWorkflows?.toString() || "0"}
          description="Workflows in progress"
          icon={GitBranch}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Case Files"
          value={stats?.totalCaseFiles?.toString() || "0"}
          description="Total case files"
          icon={ClipboardList}
          iconClassName="bg-warning/10 text-warning-foreground"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription>Recent user activity and roles</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
                navigate('/admin/users')
              }}>
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length > 0 ? users.slice(0, 4).map((user: any) => (
                <div
                  key={user._id || user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {user.firstName && user.lastName
                          ? `${user.firstName[0]}${user.lastName[0]}`
                          : user.fullName
                          ? user.fullName.split(" ").map((n: string) => n[0]).join("")
                          : user.email ? user.email[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.fullName || `${user.firstName} ${user.lastName}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                      {user.role}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user.isActive ? "bg-success" : "bg-warning"
                      }`}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                          {user.isActive ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
              navigate('/audit')
            }}>
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? activities.slice(0, 4).map((activity: any) => (
                <div
                  key={activity._id || activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GitBranch className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user?.fullName || activity.user?.firstName + ' ' + activity.user?.lastName || 'System'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Documents Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Pending Document Reviews</CardTitle>
            <CardDescription>Documents requiring administrative review</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
            console.log('Navigating to /documents')
            navigate('/documents')
          }}>
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length > 0 ? documents.slice(0, 4).map((doc: any) => (
              <div
                key={doc._id || doc.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-warning-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {doc.owner?.fullName || doc.owner?.firstName + ' ' + doc.owner?.lastName || 'Unknown'} - {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={doc.status as "pending" | "approved" | "rejected"} />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleViewDocument(doc)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-success hover:text-success"
                    onClick={() => handleDocumentAction(doc, 'approve')}
                    disabled={doc.status !== 'pending'}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDocumentAction(doc, 'reject')}
                    disabled={doc.status !== 'pending'}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending documents</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Latest Unfinished Workflows</CardTitle>
            <CardDescription>Recent workflows requiring attention (pending & in-progress)</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
            navigate('/workflows')
          }}>
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(() => {
              // Filter unfinished workflows (pending, in-progress) and sort by creation date (latest first)
              const unfinishedWorkflows = workflows
                .filter(w => w.status === 'pending' || w.status === 'in-progress')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 4);
              
              return unfinishedWorkflows.length > 0 ? unfinishedWorkflows.map((workflow: any) => (
              <div
                key={workflow._id || workflow.id}
                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{workflow.name}</p>
                  <StatusBadge status={workflow.status as "pending" | "in-progress" | "completed"} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(workflow.createdAt).toLocaleDateString()} 
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {(() => {
                        const days = Math.floor((new Date().getTime() - new Date(workflow.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                        if (days === 0) return 'Today';
                        if (days === 1) return '1 day ago';
                        if (days < 7) return `${days} days ago`;
                        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
                        return `${Math.floor(days / 30)} months ago`;
                      })()}
                    </span>
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {workflow.progress || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Progress value={workflow.progress || 0} className="h-2 flex-1 mr-2" />
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleWorkflowAction(workflow, 'advance')}
                      disabled={workflow.status === 'completed' || workflow.progress >= 100}
                    >
                      Advance
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleWorkflowAction(workflow, 'back')}
                      disabled={workflow.status === 'completed' || (workflow.progress || 0) <= 0}
                    >
                      Back
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleWorkflowAction(workflow, 'delete')}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No unfinished workflows</p>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">System Overview</CardTitle>
            <CardDescription>Current system status and metrics</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            View Details
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-2xl font-bold text-foreground">{stats?.totalDocuments || 0}</p>
              <p className="text-sm text-muted-foreground">Documents</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-2xl font-bold text-foreground">{stats?.activeWorkflows || 0}</p>
              <p className="text-sm text-muted-foreground">Active Workflows</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-2xl font-bold text-foreground">{stats?.totalCaseFiles || 0}</p>
              <p className="text-sm text-muted-foreground">Case Files</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case File Review Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Case File Review Summary</CardTitle>
            <CardDescription>Case files requiring administrative attention</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
            navigate('/case-files')
          }}>
            View All Cases
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Case Number</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Priority</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {caseFiles.length > 0 ? caseFiles.slice(0, 4).map((caseFile: any) => (
                  <tr key={caseFile._id || caseFile.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-foreground">{caseFile.caseNumber}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{caseFile.title}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        caseFile.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                        caseFile.priority === 'high' ? 'bg-warning/10 text-warning-foreground' :
                        caseFile.priority === 'normal' ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {caseFile.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={caseFile.status as "open" | "in-progress" | "closed"} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary"
                          onClick={() => navigate(`/case-files/${caseFile._id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-success hover:text-success"
                          onClick={() => handleCaseFileAction(caseFile, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCaseFileAction(caseFile, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No case files requiring review
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specified role and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-firstName">First Name</Label>
                <Input 
                  id="add-firstName" 
                  value={addUserForm.firstName}
                  onChange={(e) => setAddUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-lastName">Last Name</Label>
                <Input 
                  id="add-lastName" 
                  value={addUserForm.lastName}
                  onChange={(e) => setAddUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">Email Address</Label>
              <Input 
                id="add-email" 
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-password">Password</Label>
              <Input 
                id="add-password" 
                type="password"
                value={addUserForm.password}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-role">Role</Label>
              <Select value={addUserForm.role} onValueChange={(value) => setAddUserForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-department">Department (Optional)</Label>
                <Input 
                  id="add-department" 
                  value={addUserForm.department}
                  onChange={(e) => setAddUserForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-position">Position (Optional)</Label>
                <Input 
                  id="add-position" 
                  value={addUserForm.position}
                  onChange={(e) => setAddUserForm(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Enter position"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddUserDialogOpen(false)
              setAddUserForm({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'user',
                department: '',
                position: ''
              })
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={!addUserForm.firstName || !addUserForm.lastName || !addUserForm.email || !addUserForm.password}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information, role, and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input 
                  id="edit-firstName" 
                  value={editUserForm.firstName}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input 
                  id="edit-lastName" 
                  value={editUserForm.lastName}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input 
                id="edit-email" 
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editUserForm.role} onValueChange={(value) => setEditUserForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input 
                  id="edit-department" 
                  value={editUserForm.department}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input 
                  id="edit-position" 
                  value={editUserForm.position}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Enter position"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={editUserForm.isActive}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="edit-isActive">User is active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditUserDialogOpen(false)
              setSelectedUser(null)
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={!editUserForm.firstName || !editUserForm.lastName || !editUserForm.email}
            >
              <Edit className="w-4 h-4 mr-2" />
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Document Dialog */}
      <Dialog open={isCreateDocumentOpen} onOpenChange={setIsCreateDocumentOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new document in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="doc-title">Title *</Label>
              <Input
                id="doc-title"
                placeholder="Enter document title"
                value={createDocumentForm.title}
                onChange={(e) => setCreateDocumentForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-type">Type *</Label>
              <Select 
                value={createDocumentForm.type} 
                onValueChange={(value) => setCreateDocumentForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Report">Report</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Survey">Survey</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Policy">Policy</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-description">Description</Label>
              <Textarea
                id="doc-description"
                placeholder="Enter document description (optional)"
                value={createDocumentForm.description}
                onChange={(e) => setCreateDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDocumentOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDocument}
              disabled={!createDocumentForm.title || !createDocumentForm.type}
            >
              Create Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDocumentOpen} onOpenChange={setIsViewDocumentOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Review document information before making approval decision.
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Title</label>
                <p className="text-sm text-muted-foreground">{selectedDocument.title}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Type</label>
                <p className="text-sm text-muted-foreground capitalize">{selectedDocument.type}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <StatusBadge status={selectedDocument.status as "pending" | "approved" | "rejected"} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">{selectedDocument.description || 'No description provided'}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Created By</label>
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.owner?.fullName || selectedDocument.owner?.firstName + ' ' + selectedDocument.owner?.lastName || 'Unknown'}
                </p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Created Date</label>
                <p className="text-sm text-muted-foreground">{new Date(selectedDocument.createdAt).toLocaleString()}</p>
              </div>
              {selectedDocument.updatedAt && selectedDocument.updatedAt !== selectedDocument.createdAt && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedDocument.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDocumentOpen(false)}>
              Close
            </Button>
            {selectedDocument && selectedDocument.status === 'pending' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsViewDocumentOpen(false)
                    handleDocumentAction(selectedDocument, 'reject')
                  }}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewDocumentOpen(false)
                    handleDocumentAction(selectedDocument, 'approve')
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
