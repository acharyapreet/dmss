import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { Navbar } from "../components/navbar"
import { LoginForm } from "../components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { StatusBadge } from "../components/ui/status-badge"
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
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import {
  FolderOpen,
  Search,
  Plus,
  Filter,
  Eye,
  Calendar,
  User,
  Paperclip,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

const categories = ["All Categories", "Zoning", "Permits", "Environmental", "Licensing", "Infrastructure", "Events"]
const statusFilters = ["All Status", "open", "in-progress", "closed", "archived"]

export default function CaseFilesPage() {
  const { isAuthenticated, user, token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [caseFiles, setCaseFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [createForm, setCreateForm] = useState({
    title: '',
    category: '',
    description: ''
  })
  const [showArchived, setShowArchived] = useState(false)

  // Fetch case files from API
  useEffect(() => {
    const fetchCaseFiles = async () => {
      if (!token) return
      
      try {
        // Build query parameters
        let queryParams = 'limit=20&page=1'
        
        if (showArchived) {
          queryParams += '&status=archived'
        }
        // Note: Don't exclude archived by default since there might not be any archived case files
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setCaseFiles(data.data?.caseFiles || data.data || [])
        } else {
          setCaseFiles([]) // Set empty array on error
        }
      } catch (error) {
        setCaseFiles([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchCaseFiles()
    }
  }, [isAuthenticated, token, showArchived])

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
              <p className="text-muted-foreground">Loading case files...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const filteredCaseFiles = caseFiles.filter((cf: any) => {
    const matchesSearch = cf.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cf.owner?.fullName || cf.owner?.firstName + ' ' + cf.owner?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All Categories" || 
      cf.category === categoryFilter.toLowerCase() ||
      cf.category === categoryFilter
    const matchesStatus = statusFilter === "All Status" || cf.status === statusFilter
    
    // If showing archived, only show archived case files
    // If not showing archived, exclude archived case files
    const matchesArchiveFilter = showArchived ? cf.status === 'archived' : cf.status !== 'archived'
    
    return matchesSearch && matchesCategory && matchesStatus && matchesArchiveFilter
  })

  // Handle case file operations
  const handleCreateCaseFile = async (formData: any) => {
    if (!token) return
    
    try {
      const caseFileData = {
        title: formData.title,
        category: formData.category,
        description: formData.description
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(caseFileData)
      })
      
      if (response.ok) {
        const data = await response.json()
        const newCaseFile = data.data?.caseFile || data.data
        setCaseFiles(prev => [newCaseFile, ...prev])
        setIsCreateDialogOpen(false)
        setCreateForm({ title: '', category: '', description: '' })
        alert('Case file created successfully')
      } else {
        const data = await response.json()
        alert(`Failed to create case file: ${data.message}`)
      }
    } catch (error) {
      alert('Failed to create case file')
    }
  }

  const handleViewCaseFile = (caseFile: any) => {
    const details = `
Case File Details:
Case Number: ${caseFile.caseNumber}
Title: ${caseFile.title}
Category: ${caseFile.category}
Status: ${caseFile.status}
Description: ${caseFile.description || 'No description'}
Created: ${new Date(caseFile.createdAt).toLocaleString()}
Owner: ${caseFile.owner?.fullName || caseFile.owner?.firstName + ' ' + caseFile.owner?.lastName || 'Unknown'}
    `.trim()
    alert(details)
  }

  const handleDeleteCaseFile = async (caseFile: any) => {
    if (!token) return
    
    const confirmed = confirm(`Are you sure you want to delete case file "${caseFile.title}"?`)
    if (!confirmed) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files/${caseFile._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setCaseFiles(prev => prev.filter((cf: any) => cf._id !== caseFile._id))
        alert('Case file deleted successfully')
      } else {
        const data = await response.json()
        alert(`Failed to delete case file: ${data.message}`)
      }
    } catch (error) {
      alert('Failed to delete case file')
    }
  }

  const handleArchiveCaseFile = async (caseFile: any) => {
    if (!token) return
    
    const isArchiving = caseFile.status !== 'archived'
    const action = isArchiving ? 'archive' : 'unarchive'
    const confirmed = confirm(`Are you sure you want to ${action} "${caseFile.title}"?`)
    if (!confirmed) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004/api'}/case-files/${caseFile._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: isArchiving ? 'archived' : 'closed'
        })
      })
      
      if (response.ok) {
        // Remove case file from current view since it's now archived/unarchived
        setCaseFiles(prev => prev.filter((cf: any) => cf._id !== caseFile._id))
        alert(`Case file ${action}d successfully`)
      } else {
        const data = await response.json()
        alert(`Failed to ${action} case file: ${data.message}`)
      }
    } catch (error) {
      alert(`Failed to ${action} case file`)
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
              <h1 className="text-2xl font-bold text-foreground">
                {showArchived ? 'Archived Case Files' : 'Case Files'}
              </h1>
              <p className="text-muted-foreground">
                {showArchived ? 'View and manage archived case files' : 'Manage case files and associated documents'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    View Active
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    View Archived
                  </>
                )}
              </Button>
              {!showArchived && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Case File
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create New Case File</DialogTitle>
                      <DialogDescription>
                        Open a new case file to organize related documents and workflows.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cf-title">Case Title</Label>
                        <Input 
                          id="cf-title" 
                          placeholder="Enter case title"
                          value={createForm.title}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cf-category">Category</Label>
                        <Select value={createForm.category} onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.slice(1).map((category) => (
                              <SelectItem key={category} value={category.toLowerCase()}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cf-description">Description</Label>
                        <Textarea 
                          id="cf-description" 
                          placeholder="Describe the case details"
                          value={createForm.description}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsCreateDialogOpen(false)
                        setCreateForm({ title: '', category: '', description: '' })
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleCreateCaseFile(createForm)}
                        disabled={!createForm.title || !createForm.category}
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Create Case
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search case files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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

          {/* Case Files Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCaseFiles.map((caseFile: any) => (
              <Card key={caseFile._id || caseFile.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        caseFile.status === "closed" ? "bg-success/10" :
                        caseFile.status === "archived" ? "bg-muted/50" :
                        caseFile.status === "open" ? "bg-warning/10" : "bg-primary/10"
                      }`}>
                        <FolderOpen className={`w-5 h-5 ${
                          caseFile.status === "closed" ? "text-success" :
                          caseFile.status === "archived" ? "text-muted-foreground" :
                          caseFile.status === "open" ? "text-warning-foreground" : "text-primary"
                        }`} />
                      </div>
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">{caseFile.caseNumber}</p>
                        <StatusBadge status={caseFile.status as "open" | "in-progress" | "closed" | "archived"} />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCaseFile(caseFile)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveCaseFile(caseFile)}>
                          <Archive className="w-4 h-4 mr-2" />
                          {caseFile.status === 'archived' ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCaseFile(caseFile)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h3 className="font-medium text-foreground mb-2 line-clamp-2">{caseFile.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-secondary text-xs">{caseFile.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{caseFile.owner?.fullName || caseFile.owner?.firstName + ' ' + caseFile.owner?.lastName || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(caseFile.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Paperclip className="w-4 h-4" />
                        <span>0 documents</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(caseFile.updatedAt || caseFile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" onClick={() => handleViewCaseFile(caseFile)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Open Case
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCaseFiles.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No case files found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}