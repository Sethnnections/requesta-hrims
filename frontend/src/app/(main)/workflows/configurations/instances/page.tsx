
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { WorkflowType, WorkflowStatus } from '@/types/workflow';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

export default function WorkflowInstancesPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const {
    workflowInstances,
    getAllWorkflowInstances,
    isLoading,
    pagination,
  } = useWorkflowStore();
  
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    workflowType: '',
    department: '',
  });

  useEffect(() => {
    loadInstances();
  }, [search, filters]);

  const loadInstances = async () => {
    if (hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_VIEW_ALL)) {
      await getAllWorkflowInstances({
        search: search || undefined,
        status: filters.status || undefined,
        workflowType: filters.workflowType as WorkflowType || undefined,
        department: filters.department || undefined,
        page: 1,
        limit: 50,
      });
    }
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.DRAFT:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case WorkflowStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case WorkflowStatus.IN_PROGRESS:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case WorkflowStatus.APPROVED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case WorkflowStatus.REJECTED:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      case WorkflowStatus.CANCELLED:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case WorkflowStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWorkflowTypeIcon = (type: WorkflowType) => {
    switch(type) {
      case WorkflowType.LEAVE_REQUEST:
        return '🏖️';
      case WorkflowType.LOAN_APPLICATION:
        return '💰';
      case WorkflowType.TRAVEL_REQUEST:
        return '✈️';
      case WorkflowType.OVERTIME_CLAIM:
        return '⏰';
      case WorkflowType.PAYROLL_APPROVAL:
        return '💳';
      case WorkflowType.EXPENSE_CLAIM:
        return '🧾';
      case WorkflowType.RECRUITMENT:
        return '👥';
      case WorkflowType.PERFORMANCE_REVIEW:
        return '📊';
      default:
        return '📄';
    }
  };

  const getWorkflowTypeLabel = (type: WorkflowType) => {
    return type.replace('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_VIEW_ALL)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view all workflow instances</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Workflow Instances</h1>
          <p className="text-gray-600">Monitor all workflow processes across the organization</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Workflow Instances</CardTitle>
              <CardDescription>
                {pagination.total} total instances • {workflowInstances.filter(i => i.status === WorkflowStatus.PENDING).length} pending
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search instances..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-md bg-gray-50">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              className="border rounded-md px-3 py-1 text-sm"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              {Object.values(WorkflowStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              className="border rounded-md px-3 py-1 text-sm"
              value={filters.workflowType}
              onChange={(e) => setFilters({...filters, workflowType: e.target.value})}
            >
              <option value="">All Types</option>
              {Object.values(WorkflowType).map(type => (
                <option key={type} value={type}>
                  {getWorkflowTypeLabel(type)}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFilters({ status: '', workflowType: '', department: '' })}
            >
              Clear Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading instances...</p>
            </div>
          ) : workflowInstances.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No workflow instances found</h3>
              <p className="text-gray-600">
                {search || Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters' 
                  : 'No workflow instances have been created yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Initiator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowInstances.map((instance) => (
                    <TableRow key={instance._id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        {instance._id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getWorkflowTypeIcon(instance.workflowType)}</span>
                          <span className="text-sm">
                            {getWorkflowTypeLabel(instance.workflowType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {instance.initialData?.title || 'Untitled Request'}
                        </div>
                        {instance.initialData?.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {instance.initialData.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {instance.initiatedByUser?.fullName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {instance.entity?.department?.departmentName || 'No department'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(instance.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">
                            {instance.currentStage + 1}/{instance.workflowDefinition?.stages?.length || 1}
                          </span>
                          <span className="text-xs text-gray-500">stage</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(instance.createdAt, 'display')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(instance.createdAt, 'displayWithTime').split(', ')[1]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/workflows/configurations/instances/${instance._id}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Admin actions based on status */}
                          {hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_APPROVE) && 
                           instance.status === WorkflowStatus.PENDING && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => router.push(`/workflows/configurations/instances/${instance._id}/approve`)}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_REJECT) && 
                           instance.status === WorkflowStatus.PENDING && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => router.push(`/workflows/configurations/instances/${instance._id}/reject`)}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_CANCEL) && 
                           [WorkflowStatus.PENDING, WorkflowStatus.IN_PROGRESS].includes(instance.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-600 border-gray-200 hover:bg-gray-50"
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this workflow?')) {
                                  // Handle cancel logic here
                                }
                              }}
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {workflowInstances.length} of {pagination.total} instances
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => getAllWorkflowInstances({
                        ...filters,
                        page: pagination.page - 1,
                        limit: pagination.limit,
                      })}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!pagination.hasNextPage}
                      onClick={() => getAllWorkflowInstances({
                        ...filters,
                        page: pagination.page + 1,
                        limit: pagination.limit,
                      })}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Instances</p>
                <h3 className="text-2xl font-bold mt-2">{pagination.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <h3 className="text-2xl font-bold mt-2">
                  {workflowInstances.filter(i => i.status === WorkflowStatus.PENDING).length}
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <h3 className="text-2xl font-bold mt-2">
                  {workflowInstances.filter(i => i.status === WorkflowStatus.IN_PROGRESS).length}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <h3 className="text-2xl font-bold mt-2">
                  {workflowInstances.filter(i => i.status === WorkflowStatus.APPROVED).length}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
