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
import { Search, Filter, Eye, Calendar, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { WorkflowType, WorkflowStatus } from '@/types/workflow';

export default function CompletedWorkflowsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { myWorkflows, getMyWorkflows, isLoading } = useWorkflowStore();
  
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filteredWorkflows, setFilteredWorkflows] = useState(myWorkflows);

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    filterWorkflows();
  }, [search, filterResult, filterType, myWorkflows]);

  const loadWorkflows = async () => {
    await getMyWorkflows({ initiatedByMe: true });
  };

  const filterWorkflows = () => {
    let filtered = myWorkflows.filter(w => 
      w.status === WorkflowStatus.APPROVED || 
      w.status === WorkflowStatus.REJECTED || 
      w.status === WorkflowStatus.COMPLETED ||
      w.status === WorkflowStatus.CANCELLED
    );

    if (search) {
      filtered = filtered.filter(workflow =>
        workflow.workflowType.toLowerCase().includes(search.toLowerCase()) ||
        workflow.initialData?.title?.toLowerCase().includes(search.toLowerCase()) ||
        workflow.initialData?.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterResult !== 'all') {
      if (filterResult === 'approved') {
        filtered = filtered.filter(workflow => 
          workflow.status === WorkflowStatus.APPROVED || workflow.status === WorkflowStatus.COMPLETED
        );
      } else if (filterResult === 'rejected') {
        filtered = filtered.filter(workflow => workflow.status === WorkflowStatus.REJECTED);
      } else if (filterResult === 'cancelled') {
        filtered = filtered.filter(workflow => workflow.status === WorkflowStatus.CANCELLED);
      }
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(workflow => workflow.workflowType === filterType);
    }

    setFilteredWorkflows(filtered);
  };

  const getWorkflowTypeLabel = (type: WorkflowType) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getResultColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.APPROVED:
      case WorkflowStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case WorkflowStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case WorkflowStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultIcon = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.APPROVED:
      case WorkflowStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case WorkflowStatus.REJECTED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const stats = {
    total: filteredWorkflows.length,
    approved: filteredWorkflows.filter(w => 
      w.status === WorkflowStatus.APPROVED || w.status === WorkflowStatus.COMPLETED
    ).length,
    rejected: filteredWorkflows.filter(w => w.status === WorkflowStatus.REJECTED).length,
    cancelled: filteredWorkflows.filter(w => w.status === WorkflowStatus.CANCELLED).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Completed Workflows</h1>
          <p className="text-gray-600">History of your completed workflow requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadWorkflows} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
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
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
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
                placeholder="Search completed workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterResult} onValueChange={setFilterResult}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <CardTitle>Completed Requests</CardTitle>
              <CardDescription>
                {filteredWorkflows.length} completed request{filteredWorkflows.length !== 1 ? 's' : ''} found
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
              <p className="mt-2 text-gray-600">Loading completed workflows...</p>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No completed workflows</h3>
              <p className="text-gray-600">
                {search ? 'Try a different search' : 'You don\'t have any completed workflow requests yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title/Description</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.map((workflow) => {
                    const completedDate = workflow.completedAt || workflow.updatedAt;
                    const startDate = new Date(workflow.initiatedAt);
                    const endDate = new Date(completedDate);
                    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                    
                    return (
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
                          <div className="flex items-center gap-2">
                            {getResultIcon(workflow.status)}
                            <Badge className={getResultColor(workflow.status)}>
                              {workflow.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(completedDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(completedDate).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {durationDays} day{durationDays !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-400">
                            Started: {new Date(workflow.initiatedAt).toLocaleDateString()}
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}