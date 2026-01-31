import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { StatCard } from "../../components/ui/stat-card"
import { StatusBadge } from "../../components/ui/status-badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { SkeletonStats, SkeletonCard, SkeletonTable } from "../../components/ui/skeleton-card"
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
  FileText,
  GitBranch,
  FolderOpen,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Eye,
  Users,
  Plus,
} from "lucide-react"

export function ManagerDashboard() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>({})
  const [documents, setDocuments] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [caseFiles, setCaseFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false)
  const [createDocumentForm, setCreateDocumentForm] = useState({
    title: '',
    type: '',
    description: ''
  })
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  // Fetch manager dashboard data
  useEffect(() => {
    const fetchManagerData = async () => {
      if (!token) {
        console.log('❌ Manager Dashboard: No token available')
        return
      }
      
      console.log('🔍 Manager Dashboard: Starting data fetch...')
      console.log('Token available:', !!token)
      console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5004/api')
      
      try {
        console.log('📤 Manager Dashboard: Making parallel API calls...')
        
        // Make all API calls in parallel for better performance
        const [statsResponse, docsResponse, workflowsResponse, caseFilesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/documents?status=pending&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/workflows?status=pending&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files?status=open&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        console.log('📥 Manager Dashboard: API responses received:')
        console.log('Stats response:', statsResponse.status, statsResponse.ok)
        console.log('Documents response:', docsResponse.status, docsResponse.ok)
        console.log('Workflows response:', workflowsResponse.status, workflowsResponse.ok)
        console.log('Case files response:', caseFilesResponse.status, caseFilesResponse.ok)

        // Process responses
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          console.log('✅ Manager Dashboard: Stats data:', statsData.data?.stats)
          setStats(statsData.data?.stats || {})
        } else {
          console.error('❌ Manager Dashboard: Failed to fetch stats:', statsResponse.status)
          setStats({})
        }

        if (docsResponse.ok) {
          const docsData = await docsResponse.json()
          console.log('✅ Manager Dashboard: Documents data:', docsData.data?.documents?.length, 'documents')
          setDocuments(docsData.data?.documents || [])
        } else {
          console.error('❌ Manager Dashboard: Failed to fetch documents:', docsResponse.status)
          setDocuments([])
        }

        if (workflowsResponse.ok) {
          const workflowsData = await workflowsResponse.json()
          console.log('✅ Manager Dashboard: Workflows data:', workflowsData.data?.workflows?.length, 'workflows')
          setWorkflows(workflowsData.data?.workflows || [])
        } else {
          console.error('❌ Manager Dashboard: Failed to fetch workflows:', workflowsResponse.status)
          setWorkflows([])
        }

        if (caseFilesResponse.ok) {
          const caseFilesData = await caseFilesResponse.json()
          console.log('✅ Manager Dashboard: Case files data:', caseFilesData.data?.caseFiles?.length, 'case files')
          setCaseFiles(caseFilesData.data?.caseFiles || [])
        } else {
          console.error('❌ Manager Dashboard: Failed to fetch case files:', caseFilesResponse.status)
          setCaseFiles([])
        }

      } catch (error) {
        console.error('❌ Manager Dashboard: Failed to fetch data:', error)
      } finally {
        console.log('✅ Manager Dashboard: Data fetch completed')
        setLoading(false)
      }
    }

    fetchManagerData()
  }, [token])

  // Handle document approval/rejection
  const handleDocumentAction = async (document: any, action: 'approve' | 'reject') => {
    if (!token) return
    
    const confirmed = confirm(`Are you sure you want to ${action} "${document.title}"?`)
    if (!confirmed) return
    
    try {
      console.log(`📋 ${action}ing document:`, document._id)
      
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
        setDocuments(prev => prev.filter(d => d._id !== document._id))
        alert(`Document ${action}d successfully!`)
      } else {
        const data = await response.json()
        alert(`Failed to ${action} document: ${data.message}`)
      }
    } catch (error) {
      console.error(`❌ Failed to ${action} document:`, error)
      alert(`Failed to ${action} document`)
    }
  }

  // Handle workflow advancement
  const handleWorkflowAdvance = async (workflow: any) => {
    if (!token) return
    
    const confirmed = confirm(`Advance workflow "${workflow.name}" to the next step?`)
    if (!confirmed) return
    
    try {
      console.log('⚡ Advancing workflow:', workflow._id)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/workflows/${workflow._id}/advance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const updatedWorkflow = data.data?.workflow || data.data
        setWorkflows(prev => prev.map((w: any) => w._id === workflow._id ? updatedWorkflow : w))
        alert(`Workflow advanced to ${updatedWorkflow.progress}%`)
      } else {
        const data = await response.json()
        alert(`Failed to advance workflow: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Failed to advance workflow:', error)
      alert('Failed to advance workflow')
    }
  }

  // Handle workflow backward movement
  const handleWorkflowBackward = async (workflow: any) => {
    if (!token) return
    
    const confirmed = confirm(`Move workflow "${workflow.name}" backward to the previous step?`)
    if (!confirmed) return
    
    try {
      console.log('⬅️ Moving workflow backward:', workflow._id)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/workflows/${workflow._id}/backward`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const updatedWorkflow = data.data?.workflow || data.data
        setWorkflows(prev => prev.map((w: any) => w._id === workflow._id ? updatedWorkflow : w))
        alert(`Workflow moved back to ${updatedWorkflow.progress}%`)
      } else {
        const data = await response.json()
        alert(`Failed to move workflow backward: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Failed to move workflow backward:', error)
      alert('Failed to move workflow backward')
    }
  }

  // Handle case file review
  const handleCaseFileReview = (caseFile: any) => {
    setSelectedItem(caseFile)
    setIsReviewDialogOpen(true)
  }

  // Handle view history
  const handleViewHistory = async () => {
    if (!token) return
    
    try {
      console.log('📜 Fetching history data...')
      
      // Fetch audit logs for manager activities
      const historyResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/audit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (historyResponse.ok) {
        const historyResponseData = await historyResponse.json()
        setHistoryData(historyResponseData.data?.auditLogs || [])
        setIsHistoryDialogOpen(true)
      } else {
        alert('Failed to fetch history data')
      }
    } catch (error) {
      console.error('❌ Failed to fetch history:', error)
      alert('Failed to fetch history')
    }
  }
  const handleCaseFileAction = async (caseFile: any, action: 'approve' | 'reject') => {
    if (!token) return
    
    try {
      console.log(`📁 ${action}ing case file:`, caseFile._id)
      
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
        setIsReviewDialogOpen(false)
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

  // Handle document creation
  const handleCreateDocument = async () => {
    if (!token) return
    
    if (!createDocumentForm.title || !createDocumentForm.type) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      console.log('📄 Creating document:', createDocumentForm)
      console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5004/api')
      console.log('Token:', token ? 'Present' : 'Missing')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createDocumentForm)
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Document created successfully:', data)
        setDocuments(prev => [data.data.document, ...prev])
        setCreateDocumentForm({ title: '', type: '', description: '' })
        setIsCreateDocumentOpen(false)
        alert('Document created successfully!')
      } else {
        const data = await response.json()
        console.error('Failed to create document:', data)
        alert(`Failed to create document: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Failed to create document:', error)
      alert('Failed to create document')
    }
  }

  // Handle view document details
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document)
    setIsViewDocumentOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-muted-foreground">Review and approve documents, workflows, and case files</p>
          </div>
        </div>

        {/* Loading Stats */}
        <SkeletonStats />

        {/* Loading Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Loading Table */}
        <SkeletonCard />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">Review and approve documents, workflows, and case files</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDocumentOpen} onOpenChange={setIsCreateDocumentOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new document in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter document title"
                    value={createDocumentForm.title}
                    onChange={(e) => setCreateDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type *</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
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
          <Button variant="outline" size="sm" onClick={handleViewHistory}>
            <Clock className="w-4 h-4 mr-2" />
            View History
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Approvals"
          value={documents.length.toString()}
          description="Documents awaiting review"
          icon={Clock}
          iconClassName="bg-warning/10 text-warning-foreground"
        />
        <StatCard
          title="Active Workflows"
          value={workflows.length.toString()}
          description="Workflows in progress"
          icon={GitBranch}
          trend={{ value: 5, isPositive: true }}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Case Files"
          value={caseFiles.length.toString()}
          description="Under review"
          icon={FolderOpen}
          iconClassName="bg-accent/10 text-accent"
        />
        <StatCard
          title="Team Members"
          value={stats.totalUsers?.toString() || "0"}
          description="Active users"
          icon={Users}
          trend={{ value: 15, isPositive: true }}
          iconClassName="bg-success/10 text-success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Document Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Pending Document Approvals</CardTitle>
              <CardDescription>Documents requiring your review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
              console.log('Manager Dashboard: Navigating to /documents')
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
                        by {doc.createdBy?.fullName || doc.createdBy?.firstName + ' ' + doc.createdBy?.lastName || 'Unknown'} - {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-success hover:text-success"
                      onClick={() => handleDocumentAction(doc, 'approve')}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDocumentAction(doc, 'reject')}
                    >
                      <XCircle className="w-4 h-4" />
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

        {/* Workflow Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Workflow Progress</CardTitle>
              <CardDescription>Active workflows overview</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
              console.log('Manager Dashboard: Navigating to /workflows')
              navigate('/workflows')
            }}>
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflows.length > 0 ? workflows.slice(0, 4).map((workflow: any) => (
                <div
                  key={workflow._id || workflow.id}
                  className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{workflow.name}</p>
                    <StatusBadge status={workflow.status as "in-progress" | "pending"} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(workflow.createdAt).toLocaleDateString()}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {workflow.progress || 25}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Progress value={workflow.progress || 25} className="h-2 flex-1 mr-2" />
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleWorkflowAdvance(workflow)}
                        disabled={workflow.progress >= 100}
                      >
                        Advance
                      </Button>
                      {(workflow.progress || 25) > 25 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleWorkflowBackward(workflow)}
                        >
                          ←
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active workflows</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case File Review Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Case File Review Summary</CardTitle>
            <CardDescription>Case files requiring attention</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
            console.log('Manager Dashboard: Navigating to /case-files')
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
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Documents</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {caseFiles.length > 0 ? caseFiles.slice(0, 4).map((caseFile: any) => (
                  <tr key={caseFile._id || caseFile.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-foreground">{caseFile.caseNumber}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{caseFile.title}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">0 files</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={caseFile.status as "open" | "in-progress" | "closed"} />
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary"
                        onClick={() => handleCaseFileReview(caseFile)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No case files under review
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Case File Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Review Case File</DialogTitle>
            <DialogDescription>
              Review and take action on this case file.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Case Number</label>
                <p className="text-sm text-muted-foreground font-mono">{selectedItem.caseNumber}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Title</label>
                <p className="text-sm text-muted-foreground">{selectedItem.title}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Category</label>
                <p className="text-sm text-muted-foreground capitalize">{selectedItem.category}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">{selectedItem.description || 'No description provided'}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Created</label>
                <p className="text-sm text-muted-foreground">{new Date(selectedItem.createdAt).toLocaleString()}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Owner</label>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.owner?.fullName || selectedItem.owner?.firstName + ' ' + selectedItem.owner?.lastName || 'Unknown'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedItem && handleCaseFileAction(selectedItem, 'reject')}
            >
              Reject
            </Button>
            <Button 
              onClick={() => selectedItem && handleCaseFileAction(selectedItem, 'approve')}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
            <DialogDescription>
              Recent activities and changes in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {historyData.length > 0 ? historyData.slice(0, 20).map((item: any, index: number) => (
                <div key={item.id || index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.action || 'Unknown Action'}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.resource || item.details || 'No details available'}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        By: {item.user || 'System'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.timestamp || new Date(item.createdAt).toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        (item.status || 'success') === 'success' ? 'bg-success/10 text-success' : 
                        (item.status || 'success') === 'warning' ? 'bg-warning/10 text-warning-foreground' : 
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {(item.status || 'success').charAt(0).toUpperCase() + (item.status || 'success').slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No history data available</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
              Close
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
