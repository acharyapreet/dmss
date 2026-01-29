"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Progress } from "@/components/ui/progress"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  GitBranch,
  Search,
  Plus,
  Filter,
  Eye,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  PlayCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchParams } from "next/navigation"

const workflowTemplates = ["All Templates", "Document Approval", "Contract Review", "Permit Request", "Internal Memo"]
const statusFilters = ["All Status", "pending", "in-progress", "completed", "cancelled"]

export default function WorkflowsPage() {
  const { isAuthenticated, user, token } = useAuth()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [templateFilter, setTemplateFilter] = useState("All Templates")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    document: ''
  })

  // Fetch workflows from API
  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!token) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/workflows`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setWorkflows(data.data?.workflows || data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch workflows:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchWorkflows()
    }
  }, [isAuthenticated, token])

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
              <p className="text-muted-foreground">Loading workflows...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const filteredWorkflows = workflows.filter((wf: any) => {
    const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wf.createdBy?.fullName || wf.createdBy?.firstName + ' ' + wf.createdBy?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTemplate = templateFilter === "All Templates" || wf.template === templateFilter
    const matchesStatus = statusFilter === "All Status" || wf.status === statusFilter
    return matchesSearch && matchesTemplate && matchesStatus
  })

  // Handle workflow operations
  const handleCreateWorkflow = async (formData: any) => {
    if (!token) return
    
    console.log('🔧 Creating workflow with data:', formData)
    
    try {
      // Prepare the workflow data
      const workflowData = {
        name: formData.name,
        description: formData.description,
        // Don't send document field if it's just a template selection
        // document: null, // Will be handled separately if needed
      }
      
      console.log('📤 Sending workflow data:', workflowData)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/workflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      })
      
      console.log('📥 Workflow response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Workflow response data:', data)
        const newWorkflow = data.data?.workflow || data.data
        setWorkflows(prev => [newWorkflow, ...prev])
        setIsCreateDialogOpen(false)
        setCreateForm({ name: '', description: '', document: '' })
        alert('Workflow created successfully')
      } else {
        const data = await response.json()
        console.error('❌ Workflow creation failed:', data)
        alert(`Failed to create workflow: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Workflow creation error:', error)
      alert('Failed to create workflow')
    }
  }

  const handleViewWorkflow = (workflow: any) => {
    const details = `
Workflow Details:
Name: ${workflow.name}
Status: ${workflow.status}
Description: ${workflow.description || 'No description'}
Created: ${new Date(workflow.createdAt).toLocaleString()}
Created By: ${workflow.createdBy?.fullName || workflow.createdBy?.firstName + ' ' + workflow.createdBy?.lastName || 'Unknown'}
Steps: ${workflow.steps?.length || 0}
    `.trim()
    alert(details)
  }

  const handleAdvanceWorkflow = async (workflow: any) => {
    if (!token) return
    
    const confirmed = confirm(`Advance workflow "${workflow.name}" to the next step?`)
    if (!confirmed) return
    
    console.log('⚡ Advancing workflow:', workflow._id, 'Current status:', workflow.status)
    
    try {
      // Determine next status based on current status
      let nextStatus = workflow.status
      if (workflow.status === 'pending') {
        nextStatus = 'in-progress'
      } else if (workflow.status === 'in-progress') {
        nextStatus = 'completed'
      }
      
      console.log('📤 Updating workflow status to:', nextStatus)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/workflows/${workflow._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      })
      
      console.log('📥 Advance response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Advance response data:', data)
        const updatedWorkflow = data.data?.workflow || data.data
        setWorkflows(prev => prev.map((w: any) => w._id === workflow._id ? updatedWorkflow : w))
        alert(`Workflow ${nextStatus === 'completed' ? 'completed' : 'advanced'} successfully`)
      } else {
        const data = await response.json()
        console.error('❌ Advance failed:', data)
        alert(`Failed to advance workflow: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Advance error:', error)
      alert('Failed to advance workflow')
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
              <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
              <p className="text-muted-foreground">Track and manage document workflows</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Start New Workflow</DialogTitle>
                  <DialogDescription>
                    Select a template and provide details to start a new workflow.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="wf-name">Workflow Name</Label>
                    <Input 
                      id="wf-name" 
                      placeholder="Enter workflow name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wf-template">Template</Label>
                    <Select value={createForm.document} onValueChange={(value) => setCreateForm(prev => ({ ...prev, document: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflowTemplates.slice(1).map((template) => (
                          <SelectItem key={template} value={template.toLowerCase().replace(" ", "-")}>
                            {template}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wf-description">Description</Label>
                    <Textarea 
                      id="wf-description" 
                      placeholder="Describe the purpose of this workflow"
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wf-document">Attach Document (Optional)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document to attach" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget-2025">Budget Proposal 2025</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure Report</SelectItem>
                        <SelectItem value="environmental">Environmental Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    setCreateForm({ name: '', description: '', document: '' })
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleCreateWorkflow(createForm)}
                    disabled={!createForm.name}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Workflow
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{workflows.filter(w => w.status === "in-progress").length}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{workflows.filter(w => w.status === "pending").length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{workflows.filter(w => w.status === "completed").length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{workflows.filter(w => w.status === "cancelled").length}</p>
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={templateFilter} onValueChange={setTemplateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowTemplates.map((template) => (
                        <SelectItem key={template} value={template}>
                          {template}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusFilters.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "All Status" ? status : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflows List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Workflows</CardTitle>
              <CardDescription>
                {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWorkflows.map((workflow: any) => (
                  <div
                    key={workflow._id || workflow.id}
                    className="p-4 rounded-lg border border-border/50 bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          workflow.status === "completed" ? "bg-success/10" :
                          workflow.status === "cancelled" ? "bg-destructive/10" :
                          workflow.status === "pending" ? "bg-warning/10" : "bg-primary/10"
                        }`}>
                          <GitBranch className={`w-6 h-6 ${
                            workflow.status === "completed" ? "text-success" :
                            workflow.status === "cancelled" ? "text-destructive" :
                            workflow.status === "pending" ? "text-warning-foreground" : "text-primary"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-foreground">{workflow.name}</h3>
                            <StatusBadge status={workflow.status as "pending" | "in-progress" | "completed" | "cancelled"} />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created by {workflow.createdBy?.fullName || workflow.createdBy?.firstName + ' ' + workflow.createdBy?.lastName || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Started: {new Date(workflow.createdAt).toLocaleDateString()}</span>
                            <span>Steps: {workflow.steps?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 lg:w-64">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {workflow.status === 'completed' ? 'Completed' : 
                             workflow.status === 'pending' ? 'Pending' :
                             workflow.status === 'in-progress' ? 'In Progress' : 
                             workflow.status === 'cancelled' ? 'Cancelled' : 'Draft'}
                          </span>
                          <span className="text-sm font-medium">
                            {workflow.status === 'completed' ? '100%' : 
                             workflow.status === 'in-progress' ? '75%' : 
                             workflow.status === 'pending' ? '25%' : '0%'}
                          </span>
                        </div>
                        <Progress value={
                          workflow.status === 'completed' ? 100 : 
                          workflow.status === 'in-progress' ? 75 : 
                          workflow.status === 'pending' ? 25 : 0
                        } className="h-2" />
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewWorkflow(workflow)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {(user?.role === "admin" || user?.role === "manager") && workflow.status !== "completed" && (
                            <Button variant="outline" size="sm" onClick={() => handleAdvanceWorkflow(workflow)}>
                              <ArrowRight className="w-4 h-4 mr-1" />
                              Advance
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


