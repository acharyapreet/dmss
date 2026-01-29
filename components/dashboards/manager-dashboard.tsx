"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  GitBranch,
  FolderOpen,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Eye,
} from "lucide-react"

const pendingDocuments = [
  { id: 1, title: "Budget Proposal 2025", author: "Juan Perez", date: "Jan 20, 2026", priority: "high" },
  { id: 2, title: "Infrastructure Report", author: "Ana Garcia", date: "Jan 19, 2026", priority: "medium" },
  { id: 3, title: "Environmental Assessment", author: "Pedro Martinez", date: "Jan 18, 2026", priority: "high" },
  { id: 4, title: "Community Survey Results", author: "Sofia Lopez", date: "Jan 17, 2026", priority: "low" },
]

const activeWorkflows = [
  { id: 1, name: "Permit Application #1234", progress: 75, currentStep: "Manager Review", status: "in-progress" },
  { id: 2, name: "Contract Renewal #567", progress: 40, currentStep: "Legal Review", status: "in-progress" },
  { id: 3, name: "Budget Allocation #890", progress: 90, currentStep: "Final Approval", status: "pending" },
  { id: 4, name: "Staff Request #112", progress: 25, currentStep: "Department Head", status: "in-progress" },
]

const caseFileReviews = [
  { id: 1, caseNumber: "CF-2026-001", title: "Zoning Request - Commercial", status: "pending", documents: 5 },
  { id: 2, caseNumber: "CF-2026-002", title: "Building Permit - Residential", status: "in-progress", documents: 8 },
  { id: 3, caseNumber: "CF-2026-003", title: "Environmental Permit", status: "approved", documents: 12 },
  { id: 4, caseNumber: "CF-2025-098", title: "Land Use Amendment", status: "pending", documents: 3 },
]

export function ManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">Review and approve documents, workflows, and case files</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            View History
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Approvals"
          value="12"
          description="Documents awaiting review"
          icon={Clock}
          iconClassName="bg-warning/10 text-warning-foreground"
        />
        <StatCard
          title="Active Workflows"
          value="8"
          description="Workflows in progress"
          icon={GitBranch}
          trend={{ value: 5, isPositive: true }}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Case Files"
          value="24"
          description="Under review"
          icon={FolderOpen}
          iconClassName="bg-accent/10 text-accent"
        />
        <StatCard
          title="Approved This Week"
          value="18"
          description="Documents approved"
          icon={CheckCircle}
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
            <Button variant="ghost" size="sm" className="text-primary">
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        doc.priority === "high"
                          ? "bg-destructive/10"
                          : doc.priority === "medium"
                          ? "bg-warning/10"
                          : "bg-muted"
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 ${
                          doc.priority === "high"
                            ? "text-destructive"
                            : doc.priority === "medium"
                            ? "text-warning-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {doc.author} - {doc.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
            <Button variant="ghost" size="sm" className="text-primary">
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{workflow.name}</p>
                    <StatusBadge status={workflow.status as "in-progress" | "pending"} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Current: {workflow.currentStep}</p>
                    <span className="text-xs text-muted-foreground">{workflow.progress}%</span>
                  </div>
                  <Progress value={workflow.progress} className="h-2" />
                </div>
              ))}
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
          <Button variant="ghost" size="sm" className="text-primary">
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
                {caseFileReviews.map((caseFile) => (
                  <tr key={caseFile.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-foreground">{caseFile.caseNumber}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{caseFile.title}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{caseFile.documents} files</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={caseFile.status as "pending" | "in-progress" | "approved"} />
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="text-primary">
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
