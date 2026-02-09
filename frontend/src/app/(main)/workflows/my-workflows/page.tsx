'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Calendar, User, Clock, RefreshCw } from 'lucide-react';
import { WorkflowType, WorkflowStatus } from '@/types/workflow';

export default function MyWorkflowsPage() {
  const router = useRouter();
  const { user, canCreateWorkflowInstance } = useAuth();
  const { myWorkflows, getMyWorkflows, isLoading } = useWorkflowStore();
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filteredWorkflows, setFilteredWorkflows] = useState(myWorkflows);

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    filterWorkflows();
  }, [search, filterStatus, filterType, myWorkflows]);

  const loadWorkflows = async () => {
    await getMyWorkflows({ initiatedByMe: true });
  };

  const filterWorkflows = () => {
    let filtered = myWorkflows.filter(w => w.initiatedBy === user?._id);

    if (search) {
      filtered = filtered.filter(workflow =>
        workflow.workflowType.toLowerCase().includes(search.toLowerCase()) ||
        workflow.initialData?.title?.toLowerCase().includes(search.toLowerCase()) ||
        workflow.initialData?.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(workflow => workflow.workflowType === filterType);
    }

    setFilteredWorkflows(filtered);
  };

  const getWorkflowTypeLabel = (type: WorkflowType) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case WorkflowStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case WorkflowStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case WorkflowStatus.APPROVED: return 'bg-green-100 text-green-800';
      case WorkflowStatus.REJECTED: return 'bg-red-100 text-red-800';
      case WorkflowStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
      case WorkflowStatus.COMPLETED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: filteredWorkflows.length,
    draft: filteredWorkflows.filter(w => w.status === WorkflowStatus.DRAFT).length,
    pending: filteredWorkflows.filter(w => w.status === WorkflowStatus.PENDING).length,
    inProgress: filteredWorkflows.filter(w => w.status === WorkflowStatus.IN_PROGRESS).length,
    approved: filteredWorkflows.filter(w => w.status === WorkflowStatus.APPROVED).length,
    rejected: filteredWorkflows.filter(w => w.status === WorkflowStatus.REJECTED).length,
    completed: filteredWorkflows.filter(w => w.status === WorkflowStatus.COMPLETED).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">My Workflow Requests</h1>
          <p className="text-gray-600">Track and manage your workflow submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadWorkflows} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canCreateWorkflowInstance() && (
            <Button onClick={() => router.push('/workflows/create')}>
              + New Request
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.draft}</div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <div className="text-sm text-blue-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-sm text-green-600">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search my workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.values(WorkflowStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(WorkflowType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {getWorkflowTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>
                {filteredWorkflows.length} request{filteredWorkflows.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Button onClick={loadWorkflows} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your workflows...</p>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">📄</div>
              <h3 className="text-lg font-semibold">No workflows found</h3>
              <p className="text-gray-600">
                {search ? 'Try a different search' : 'You haven\'t created any workflow requests yet'}
              </p>
              {canCreateWorkflowInstance() && (
                <Button className="mt-4" onClick={() => router.push('/workflows/create')}>
                  Create Your First Request
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title/Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.map((workflow) => (
                    <TableRow key={workflow._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {workflow.workflowType === 'LEAVE_REQUEST' && '📋'}
                            {workflow.workflowType === 'LOAN_APPLICATION' && '💰'}
                            {workflow.workflowType === 'TRAVEL_REQUEST' && '✈️'}
                            {workflow.workflowType === 'OVERTIME_CLAIM' && '⏰'}
                            {workflow.workflowType === 'PAYROLL_APPROVAL' && '💳'}
                            {workflow.workflowType === 'EXPENSE_CLAIM' && '🧾'}
                          </span>
                          <span className="text-sm font-medium">
                            {getWorkflowTypeLabel(workflow.workflowType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {workflow.initialData?.title || 'No title'}
                          </div>
                          {workflow.initialData?.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {workflow.initialData.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {workflow.currentStage + 1}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span>
                            {workflow.workflowDefinition?.stages?.length || '?'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(workflow.initiatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(workflow.initiatedAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(workflow.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(workflow.updatedAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/workflows/configurations/instances/${workflow._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}