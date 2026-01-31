import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { Navbar } from "../components/navbar"
import { LoginForm } from "../components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  UserX,
  UserCheck,
  ArrowLeft,
} from "lucide-react"

export default function AdminUsersPage() {
  const { user, isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
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

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <LoginForm />
  }

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/admin/users?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUsers(data.data.users || [])
        } else {
          console.error('Failed to fetch users:', response.status)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [token])

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

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
      
      if (response.ok) {
        const data = await response.json()
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
      } else {
        const data = await response.json()
        alert(`Failed to add user: ${data.message}`)
      }
    } catch (error) {
      console.error('Add user error:', error)
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
      
      if (response.ok) {
        const data = await response.json()
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? data.data.user : u))
        setIsEditUserDialogOpen(false)
        setSelectedUser(null)
        alert('User updated successfully!')
      } else {
        const data = await response.json()
        alert(`Failed to update user: ${data.message}`)
      }
    } catch (error) {
      console.error('Update user error:', error)
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
      
      if (response.ok) {
        const data = await response.json()
        setUsers(prev => prev.map(u => u._id === user._id ? data.data.user : u))
        alert(`User ${action}d successfully!`)
      } else {
        const data = await response.json()
        alert(`Failed to ${action} user: ${data.message}`)
      }
    } catch (error) {
      console.error(`${action} user error:`, error)
      alert(`Failed to ${action} user`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground">Manage system users and their permissions</p>
              </div>
            </div>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.length > 0 ? filteredUsers.map((user: any) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.firstName && user.lastName
                            ? `${user.firstName[0]}${user.lastName[0]}`
                            : user.fullName
                            ? user.fullName.split(" ").map((n: string) => n[0]).join("")
                            : user.email ? user.email[0].toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.fullName || `${user.firstName} ${user.lastName}`}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                            {user.role}
                          </span>
                          {user.department && (
                            <span className="text-xs text-muted-foreground">
                              {user.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          user.isActive ? "bg-success" : "bg-warning"
                        }`}
                        title={user.isActive ? "Active" : "Inactive"}
                      />
                      <span className="text-sm text-muted-foreground">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
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
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <Label htmlFor="add-department">Department</Label>
                  <Input 
                    id="add-department" 
                    value={addUserForm.department}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-position">Position</Label>
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
      </main>
    </div>
  )
}