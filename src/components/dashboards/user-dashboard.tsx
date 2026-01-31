import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { StatCard } from "../../components/ui/stat-card"
import { StatusBadge } from "../../components/ui/status-badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  FileText,
  GitBranch,
  FolderOpen,
  Plus,
  Upload,
  ArrowUpRight,
  Edit,
  Eye,
  Send,
} from "lucide-react"

export function UserDashboard() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [caseFiles, setCaseFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDocDialogOpen, setIsCreateDocDialogOpen] = useState(false)
  const [isCreateWorkflowDialogOpen, setIsCreateWorkflowDialogOpen] = useState(false)
  const [isCreateCaseDialogOpen, setIsCreateCaseDialogOpen] = useState(false)
  const [docForm, setDocForm] = useState({
    title: '',
    type: '',
    description: ''
  })

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        return
      }
      
      try {
        // Make all API calls in parallel for better performance
        const [statsResponse, docsResponse, workflowsResponse, caseFilesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/documents?limit=4`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/workflows?limit=3`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files?limit=3`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])
        
        // Process responses
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data.stats)
        } else {
          setStats({})
        }

        if (docsResponse.ok) {
          const docsData = await docsResponse.json()
          setDocuments(docsData.data.documents || [])
        } else {
          setDocuments([])
        }

        if (workflowsResponse.ok) {
          const workflowsData = await workflowsResponse.json()
          setWorkflows(workflowsData.data.workflows || [])
        } else {
          setWorkflows([])
        }

        if (caseFilesResponse.ok) {
          const caseFilesData = await caseFilesResponse.json()
          setCaseFiles(caseFilesData.data.caseFiles || [])
        } else {
          setCaseFiles([])
        }

      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  // Handle document creation
  const handleCreateDocument = async (formData: any) => {
    if (!token) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsCreateDocDialogOpen(false)
        setDocForm({ title: '', type: '', description: '' })
        // Refresh documents
        window.location.reload()
      } else {
        const data = await response.json()
        alert(`Failed to create document: ${data.message}`)
      }
    } catch (error) {
      alert('Failed to create document')
    }
  }

  // Handle workflow deletion
  const handleWorkflowDelete = async (workflow: any) => {
    if (!token) return
    
    const confirmed = confirm(`Are you sure you want to delete workflow "${workflow.name}"? This action cannot be undone.`)
    if (!confirmed) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/workflows/${workflow._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setWorkflows(prev => prev.filter((w: any) => w._id !== workflow._id))
        alert(`Workflow "${workflow.name}" deleted successfully!`)
      } else {
        const data = await response.json()
        alert(`Failed to delete workflow: ${data.message}`)
      }
    } catch (error) {
      alert('Failed to delete workflow')
    }
  }

  // Handle workflow creation
  const handleCreateWorkflow = async (formData: any) => {
    if (!token) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/workflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsCreateWorkflowDialogOpen(false)
        // Refresh workflows
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  // Handle case file creation
  const handleCreateCaseFile = async (formData: any) => {
    if (!token) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsCreateCaseDialogOpen(false)
        // Refresh case files
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to create case file:', error)
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
          <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground">Create, edit, and submit documents and workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Dialog open={isCreateDocDialogOpen} onOpenChange={setIsCreateDocDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new document.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="doc-title">Document Title</Label>
                  <Input 
                    id="doc-title" 
                    placeholder="Enter document title"
                    value={docForm.title}
                    onChange={(e) => setDocForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doc-type">Document Type</Label>
                  <Select value={docForm.type} onValueChange={(value) => setDocForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Report">Report</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <SelectItem value="Survey">Survey</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Policy">Policy</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doc-description">Description</Label>
                  <Textarea 
                    id="doc-description" 
                    placeholder="Enter document description"
                    value={docForm.description}
                    onChange={(e) => setDocForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsCreateDocDialogOpen(false)
                  setDocForm({ title: '', type: '', description: '' })
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleCreateDocument(docForm)}
                  disabled={!docForm.title || !docForm.type}
                >
                  Create Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Documents"
          value={stats?.myDocuments?.toString() || "0"}
          description="Total documents created"
          icon={FileText}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Pending Review"
          value={stats?.pendingWorkflows?.toString() || "0"}
          description="Awaiting approval"
          icon={GitBranch}
          iconClassName="bg-warning/10 text-warning-foreground"
        />
        <StatCard
          title="Active Workflows"
          value={stats?.activeWorkflows?.toString() || "0"}
          description="In progress"
          icon={GitBranch}
          iconClassName="bg-accent/10 text-accent"
        />
        <StatCard
          title="Case Files"
          value={stats?.myCaseFiles?.toString() || "0"}
          description="Associated with me"
          icon={FolderOpen}
          iconClassName="bg-success/10 text-success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Dialog open={isCreateDocDialogOpen} onOpenChange={setIsCreateDocDialogOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Create Document</h3>
                  <p className="text-sm text-muted-foreground">Start a new document</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
        </Dialog>

        <Dialog open={isCreateWorkflowDialogOpen} onOpenChange={setIsCreateWorkflowDialogOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <GitBranch className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Start Workflow</h3>
                  <p className="text-sm text-muted-foreground">Initiate a new workflow</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Start New Workflow</DialogTitle>
              <DialogDescription>
                Create a new workflow process.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="wf-name">Workflow Name</Label>
                <Input id="wf-name" placeholder="Enter workflow name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wf-description">Description</Label>
                <Textarea id="wf-description" placeholder="Describe the workflow purpose" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateWorkflowDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const name = (document.getElementById('wf-name') as HTMLInputElement)?.value
                const description = (document.getElementById('wf-description') as HTMLTextAreaElement)?.value
                handleCreateWorkflow({ name, description })
              }}>
                Start Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateCaseDialogOpen} onOpenChange={setIsCreateCaseDialogOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <FolderOpen className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Open Case File</h3>
                  <p className="text-sm text-muted-foreground">Create a new case</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Case File</DialogTitle>
              <DialogDescription>
                Open a new case file to organize documents and workflows.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="case-title">Case Title</Label>
                <Input id="case-title" placeholder="Enter case title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="case-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="case-description">Description</Label>
                <Textarea id="case-description" placeholder="Describe the case details" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateCaseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const title = (document.getElementById('case-title') as HTMLInputElement)?.value
                const description = (document.getElementById('case-description') as HTMLTextAreaElement)?.value
                const category = 'general' // Default, should get from select
                handleCreateCaseFile({ title, description, category })
              }}>
                Create Case
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Documents</CardTitle>
              <CardDescription>Recent document activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
              navigate('/documents')
            }}>
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.length > 0 ? documents.map((doc: any) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Modified {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status as "draft" | "pending" | "approved" | "rejected"} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents yet</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsCreateDocDialogOpen(true)}>
                    Create your first document
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Workflows */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Latest Workflows</CardTitle>
              <CardDescription>Your most recent unfinished workflows</CardDescription>
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
                  key={workflow._id}
                  className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{workflow.name}</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={workflow.status as "in-progress" | "pending" | "completed"} />
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleWorkflowDelete(workflow)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(workflow.createdAt).toLocaleDateString()}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {workflow.progress || 0}%
                    </span>
                  </div>
                  <Progress value={workflow.progress || 50} className="h-2" />
                </div>
              )) : (
                <div className="text-center py-8">
                  <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No unfinished workflows</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsCreateWorkflowDialogOpen(true)}>
                    Start your first workflow
                  </Button>
                </div>
              );
            })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Files Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">My Case Files</CardTitle>
            <CardDescription>View status of your case files</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
            navigate('/case-files')
          }}>
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {caseFiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Case Number</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Title</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Created</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {caseFiles.map((caseFile: any) => (
                    <tr key={caseFile._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono text-foreground">{caseFile.caseNumber}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{caseFile.title}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={caseFile.status as "open" | "pending" | "closed"} />
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(caseFile.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-primary">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No case files yet</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsCreateCaseDialogOpen(true)}>
                Create your first case file
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
