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
  FileText,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Loading } from "@/components/loading"

const documentTypes = ["All Types", "Financial", "Report", "Assessment", "Survey", "HR", "Legal", "Policy", "Planning"]
const statusFilters = ["All Status", "draft", "pending", "in-progress", "approved", "rejected"]

export default function DocumentsPage() {
  const { isAuthenticated, token } = useAuth()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [createForm, setCreateForm] = useState({
    title: '',
    type: '',
    description: ''
  })

  // Fetch documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/documents`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setDocuments(data.data?.documents || data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchDocuments()
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
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Handle document operations
  const handleViewDocument = (doc: any) => {
    const details = `
Document Details:
Title: ${doc.title}
Type: ${doc.type}
Status: ${doc.status}
Description: ${doc.description || 'No description'}
Created: ${new Date(doc.createdAt).toLocaleString()}
Owner: ${doc.owner?.fullName || doc.owner?.firstName + ' ' + doc.owner?.lastName || 'Unknown'}
    `.trim()
    alert(details)
  }

  const handleEditDocument = async (doc: any) => {
    const newTitle = prompt('Enter new title:', doc.title)
    if (!newTitle || newTitle === doc.title) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/documents/${doc._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      })
      
      if (response.ok) {
        const data = await response.json()
        const updatedDocument = data.data?.document || data.data
        setDocuments(prev => prev.map((d: any) => d._id === doc._id ? updatedDocument : d))
        alert('Document updated successfully')
      } else {
        const data = await response.json()
        alert(`Failed to update document: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to update document:', error)
      alert('Failed to update document')
    }
  }

  const handleDownloadDocument = (doc: any) => {
    // Create a simple text file with document details for download
    const content = `Document: ${doc.title}\nType: ${doc.type}\nStatus: ${doc.status}\nDescription: ${doc.description || 'No description'}\nCreated: ${new Date(doc.createdAt).toLocaleString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDeleteDocument = async (doc: any) => {
    if (!token) return
    
    const confirmed = confirm(`Are you sure you want to delete "${doc.title}"?`)
    if (!confirmed) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/documents/${doc._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Remove document from local state
        setDocuments(prev => prev.filter((d: any) => d._id !== doc._id))
        alert('Document deleted successfully')
      } else {
        const data = await response.json()
        alert(`Failed to delete document: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('Failed to delete document')
    }
  }

  const handleCreateDocument = async (formData: any) => {
    if (!token) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api'}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const data = await response.json()
        const newDocument = data.data?.document || data.data
        setDocuments(prev => [newDocument, ...prev])
        setIsCreateDialogOpen(false)
        setCreateForm({ title: '', type: '', description: '' })
        alert('Document created successfully')
      } else {
        const data = await response.json()
        alert(`Failed to create document: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to create document:', error)
      alert('Failed to create document')
    }
  }

  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.owner?.fullName || doc.owner?.firstName + ' ' + doc.owner?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "All Types" || doc.type === typeFilter
    const matchesStatus = statusFilter === "All Status" || doc.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Documents</h1>
                <p className="text-muted-foreground">Manage and organize all system documents</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Document
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
                      <Label htmlFor="title">Document Title</Label>
                      <Input 
                        id="title" 
                        placeholder="Enter document title"
                        value={createForm.title}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Document Type</Label>
                      <Select value={createForm.type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.slice(1).map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Enter document description"
                        value={createForm.description}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="file">Upload File (Optional)</Label>
                      <Input id="file" type="file" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsCreateDialogOpen(false)
                      setCreateForm({ title: '', type: '', description: '' })
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleCreateDocument(createForm)}
                      disabled={!createForm.title || !createForm.type}
                    >
                      Create Document
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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

            {/* Documents Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Documents</CardTitle>
                <CardDescription>
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Document</th>
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">Type</th>
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4 hidden lg:table-cell">Author</th>
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4 hidden sm:table-cell">Date</th>
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4 hidden lg:table-cell">Size</th>
                        <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc: any) => (
                        <tr key={doc._id || doc.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{doc.title}</p>
                                <p className="text-xs text-muted-foreground md:hidden">{doc.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <span className="text-sm text-muted-foreground">{doc.type}</span>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {doc.owner?.fullName || doc.owner?.firstName + ' ' + doc.owner?.lastName || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={doc.status as "draft" | "pending" | "in-progress" | "approved" | "rejected"} />
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {doc.size || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDocument(doc)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive" 
                                  onClick={() => handleDeleteDocument(doc)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
    </Suspense>
  )
}
