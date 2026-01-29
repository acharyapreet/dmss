"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "lucide-react"

export function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return
      
      try {
        // Fetch dashboard stats
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data?.stats || {})
        }

        // Fetch recent users
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/dashboard/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          // Ensure users is always an array
          setUsers(Array.isArray(usersData.data?.users) ? usersData.data.users : [])
        }

        // Fetch recent activities
        const activitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/dashboard/activities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          // Ensure activities is always an array
          setActivities(Array.isArray(activitiesData.data?.activities) ? activitiesData.data.activities : [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Set safe defaults on error
        setStats({})
        setUsers([])
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  // Handle add user
  const handleAddUser = async () => {
    if (!token) return
    
    console.log('👤 Starting add user...')
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('Add user form data:', addUserForm)
    
    try {
      console.log('📤 Sending add user request...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addUserForm)
      })
      
      console.log('📥 Add user response status:', response.status)
      console.log('📥 Add user response ok:', response.ok)
      
      const data = await response.json()
      console.log('📥 Add user response data:', data)
      
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
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data?.stats || {})
        }
      } else {
        console.error('❌ Add user failed:', data)
        alert(`Failed to add user: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Add user error:', error)
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
    
    console.log('🔧 Starting user update...')
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('Selected user:', selectedUser)
    console.log('Update form data:', editUserForm)
    
    try {
      const updatePayload = {
        ...editUserForm,
        fullName: `${editUserForm.firstName} ${editUserForm.lastName}`
      }
      
      console.log('📤 Sending update request:', updatePayload)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })
      
      console.log('📥 Response status:', response.status)
      console.log('📥 Response ok:', response.ok)
      
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (response.ok) {
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? data.data.user : u))
        setIsEditUserDialogOpen(false)
        setSelectedUser(null)
        alert('User updated successfully!')
      } else {
        console.error('❌ Update failed:', data)
        alert(`Failed to update user: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Update error:', error)
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
    
    console.log(`🔄 Starting ${action} user...`)
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('User:', user)
    console.log('New status:', newStatus)
    
    try {
      console.log('📤 Sending status toggle request...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: newStatus
        })
      })
      
      console.log('📥 Toggle status response status:', response.status)
      console.log('📥 Toggle status response ok:', response.ok)
      
      const data = await response.json()
      console.log('📥 Toggle status response data:', data)
      
      if (response.ok) {
        setUsers(prev => prev.map(u => u._id === user._id ? data.data.user : u))
        alert(`User ${action}d successfully!`)
      } else {
        console.error(`❌ ${action} failed:`, data)
        alert(`Failed to ${action} user: ${data.message}`)
      }
    } catch (error) {
      console.error(`❌ ${action} error:`, error)
      alert(`Failed to ${action} user`)
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
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
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
              <Button variant="ghost" size="sm" className="text-primary">
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
            <Button variant="ghost" size="sm" className="text-primary">
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
    </div>
  )
}
