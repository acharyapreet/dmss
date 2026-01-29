"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
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
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  FileText,
  GitBranch,
  FolderOpen,
  Settings,
  Bell,
  Lock,
  Edit,
  Save,
  X,
} from "lucide-react"

export default function ProfilePage() {
  const { user, isAuthenticated, token, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false)
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    documentUpdates: true,
    workflowUpdates: true,
    caseFileUpdates: true,
    systemAlerts: true,
    weeklyDigest: false
  })
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    itemsPerPage: 10,
    autoSave: true
  })
  const [stats, setStats] = useState({
    documents: 0,
    workflows: 0,
    caseFiles: 0
  })
  const [loading, setLoading] = useState(false)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      console.log('👤 Initializing edit form with user data:', user)
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: user.fullName || '',
        email: user.email || ''
      })
    }
  }, [user])

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats({
            documents: data.data?.stats?.myDocuments || 0,
            workflows: data.data?.stats?.activeWorkflows || 0,
            caseFiles: data.data?.stats?.myCaseFiles || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    if (isAuthenticated) {
      fetchStats()
    }
  }, [isAuthenticated, token])

  // Fetch user preferences and notifications
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!token) return
      
      console.log('🔍 Fetching user settings...')
      
      try {
        // Fetch notification settings
        console.log('📤 Fetching notification settings...')
        const notifResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/auth/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        console.log('📥 Notification settings response status:', notifResponse.status)
        
        if (notifResponse.ok) {
          const notifData = await notifResponse.json()
          console.log('📥 Notification settings data:', notifData)
          setNotificationSettings(prev => ({ ...prev, ...notifData.data }))
        } else {
          console.error('❌ Failed to fetch notification settings:', notifResponse.status)
        }

        // Fetch preferences
        console.log('📤 Fetching preferences...')
        const prefResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/auth/preferences`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        console.log('📥 Preferences response status:', prefResponse.status)
        
        if (prefResponse.ok) {
          const prefData = await prefResponse.json()
          console.log('📥 Preferences data:', prefData)
          setPreferences(prev => ({ ...prev, ...prefData.data }))
        } else {
          console.error('❌ Failed to fetch preferences:', prefResponse.status)
        }
      } catch (error) {
        console.error('❌ Failed to fetch user settings:', error)
      }
    }

    if (isAuthenticated) {
      fetchUserSettings()
    }
  }, [isAuthenticated, token])

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!token) return
    
    console.log('🔧 Starting profile update...')
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('Edit form data:', editForm)
    
    setLoading(true)
    try {
      console.log('📤 Sending profile update request...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })
      
      console.log('📥 Profile update response status:', response.status)
      console.log('📥 Profile update response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Profile update response data:', data)
        // Extract only the necessary user fields to avoid rendering issues
        const updatedUserData = {
          _id: data.data.user._id,
          email: data.data.user.email,
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          fullName: data.data.user.fullName,
          role: data.data.user.role,
          department: data.data.user.department,
          position: data.data.user.position
        }
        updateUser(updatedUserData)
        setIsEditDialogOpen(false)
        alert('Profile updated successfully!')
      } else {
        const data = await response.json()
        console.error('❌ Profile update failed:', data)
        alert(`Failed to update profile: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (!token) return
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long')
      return
    }
    
    console.log('🔐 Starting password change...')
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('Password form (without passwords):', { 
      currentPasswordLength: passwordForm.currentPassword.length,
      newPasswordLength: passwordForm.newPassword.length,
      confirmPasswordLength: passwordForm.confirmPassword.length
    })
    
    setLoading(true)
    try {
      console.log('📤 Sending password change request...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      console.log('📥 Password change response status:', response.status)
      console.log('📥 Password change response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Password change response data:', data)
        setIsPasswordDialogOpen(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        alert('Password changed successfully!')
      } else {
        const data = await response.json()
        console.error('❌ Password change failed:', data)
        alert(`Failed to change password: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Password change error:', error)
      alert('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  // Handle notification settings update
  const handleUpdateNotifications = async () => {
    if (!token) return
    
    console.log('🔔 Starting notification settings update...')
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('Notification settings:', notificationSettings)
    
    setLoading(true)
    try {
      console.log('📤 Sending notification settings update request...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/auth/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings)
      })
      
      console.log('📥 Notification update response status:', response.status)
      console.log('📥 Notification update response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Notification update response data:', data)
        setIsNotificationsDialogOpen(false)
        alert('Notification settings updated successfully!')
      } else {
        const data = await response.json()
        console.error('❌ Notification update failed:', data)
        alert(`Failed to update notifications: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Notification update error:', error)
      alert('Failed to update notification settings')
    } finally {
      setLoading(false)
    }
  }

  // Handle preferences update
  const handleUpdatePreferences = async () => {
    if (!token) return
    
    console.log('⚙️ Starting preferences update...')
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('Preferences:', preferences)
    
    setLoading(true)
    try {
      console.log('📤 Sending preferences update request...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })
      
      console.log('📥 Preferences update response status:', response.status)
      console.log('📥 Preferences update response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Preferences update response data:', data)
        
        // Apply theme immediately
        if (preferences.theme) {
          setTheme(preferences.theme)
        }
        
        setIsPreferencesDialogOpen(false)
        alert('Preferences updated successfully!')
      } else {
        const data = await response.json()
        console.error('❌ Preferences update failed:', data)
        alert(`Failed to update preferences: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Preferences update error:', error)
      alert('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return <LoginForm />
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary/10 text-primary"
      case "manager":
        return "bg-accent/10 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Profile Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl font-semibold text-foreground">{user.fullName}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" value={user.fullName} readOnly className="pl-10 bg-secondary/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" value={user.email} readOnly className="pl-10 bg-secondary/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} readOnly className="pl-10 bg-secondary/30" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Summary</CardTitle>
                <CardDescription>Your recent activity in the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Documents</p>
                      <p className="text-xs text-muted-foreground">Created & edited</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-foreground">{stats.documents}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <GitBranch className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Workflows</p>
                      <p className="text-xs text-muted-foreground">Initiated & completed</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-foreground">{stats.workflows}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Case Files</p>
                      <p className="text-xs text-muted-foreground">Assigned to you</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-foreground">{stats.caseFiles}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  <Lock className="w-5 h-5" />
                  <span>Change Password</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                  onClick={() => setIsNotificationsDialogOpen(true)}
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                  onClick={() => setIsPreferencesDialogOpen(true)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Preferences</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Information</CardTitle>
              <CardDescription>Current session details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last Login</p>
                    <p className="text-sm font-medium text-foreground">January 23, 2026 at 9:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Session Duration</p>
                    <p className="text-sm font-medium text-foreground">Active for 1 hour</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input 
                  id="edit-firstName" 
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input 
                  id="edit-lastName" 
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input 
                  id="edit-fullName" 
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter your new password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsPasswordDialogOpen(false)
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
              }}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notifications Dialog */}
        <Dialog open={isNotificationsDialogOpen} onOpenChange={setIsNotificationsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Notification Settings</DialogTitle>
              <DialogDescription>
                Manage how and when you receive notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="document-updates">Document Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications when documents are updated</p>
                  </div>
                  <Switch
                    id="document-updates"
                    checked={notificationSettings.documentUpdates}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, documentUpdates: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="workflow-updates">Workflow Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications for workflow status changes</p>
                  </div>
                  <Switch
                    id="workflow-updates"
                    checked={notificationSettings.workflowUpdates}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, workflowUpdates: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="case-file-updates">Case File Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications for case file changes</p>
                  </div>
                  <Switch
                    id="case-file-updates"
                    checked={notificationSettings.caseFileUpdates}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, caseFileUpdates: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-alerts">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Important system notifications</p>
                  </div>
                  <Switch
                    id="system-alerts"
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNotificationsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateNotifications} disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preferences Dialog */}
        <Dialog open={isPreferencesDialogOpen} onOpenChange={setIsPreferencesDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Preferences</DialogTitle>
              <DialogDescription>
                Customize your application settings and preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="items-per-page">Items Per Page</Label>
                  <Select value={preferences.itemsPerPage.toString()} onValueChange={(value) => setPreferences(prev => ({ ...prev, itemsPerPage: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select items per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <p className="text-sm text-muted-foreground">Automatically save changes</p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={preferences.autoSave}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSave: checked }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreferencesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePreferences} disabled={loading}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
