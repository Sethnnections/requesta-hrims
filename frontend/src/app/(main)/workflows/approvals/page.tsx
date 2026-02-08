'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { WorkflowType, WorkflowStatus } from '@/types/workflow';

export default function ApprovalsPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const {
    pendingApprovals,
    getPendingApprovals,
    isLoading,
  } = useWorkflowStore();
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filteredApprovals, setFilteredApprovals] = useState(pendingApprovals);

  useEffect(() => {
    loadApprovals();
  }, []);

  useEffect(() => {
    filterApprovals();
  }, [search, filterType, pendingApprovals]);

  const loadApprovals = async () => {
    if (hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_APPROVE)) {
      await getPendingApprovals();
    }
  };

  const filterApprovals = () => {
    let filtered = pendingApprovals;

    if (search) {
      filtered = filtered.filter(approval =>
        approval.workflowType.toLowerCase().includes(search.toLowerCase()) ||
        approval.initiatedByUser?.fullName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(approval => approval.workflowType === filterType);
    }

    setFilteredApprovals(filtered);
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case WorkflowStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowTypeLabel = (type: WorkflowType) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_APPROVE)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view pending approvals</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-requesta-primary">Pending Approvals</h1>
        <p className="text-gray-600">Review and approve workflow requests</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>
                {filteredApprovals.length} request{filteredApprovals.length !== 1 ? 's' : ''} awaiting your approval
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search approvals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="LEAVE_REQUEST">Leave Requests</SelectItem>
                  <SelectItem value="LOAN_APPLICATION">Loan Applications</SelectItem>
                  <SelectItem value="TRAVEL_REQUEST">Travel Requests</SelectItem>
                  <SelectItem value="OVERTIME_CLAIM">Overtime Claims</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading approvals...</p>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">All caught up!</h3>
              <p className="text-gray-600">No pending approvals at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApprovals.map((approval) => (
                <Card key={approval._id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {approval.workflowType === 'LEAVE_REQUEST' && <Clock className="h-5 w-5 text-blue-500" />}
                            {approval.workflowType === 'LOAN_APPLICATION' && <FileText className="h-5 w-5 text-green-500" />}
                            {approval.workflowType === 'TRAVEL_REQUEST' && <Plane className="h-5 w-5 text-purple-500" />}
                            {approval.workflowType === 'OVERTIME_CLAIM' && <Clock className="h-5 w-5 text-orange-500" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {getWorkflowTypeLabel(approval.workflowType)}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {approval.initiatedByUser?.fullName || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {new Date(approval.initiatedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {getDaysSince(approval.initiatedAt)} day{getDaysSince(approval.initiatedAt) !== 1 ? 's' : ''} ago
                                </span>
                              </div>
                            </div>
                            {approval.initialData && (
                              <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                                {JSON.stringify(approval.initialData)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(approval.status)}>
                            {approval.status}
                          </Badge>
                          <Badge variant="outline">
                            Stage {approval.currentStage + 1}/{approval.workflowDefinition?.stages.length || 1}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => router.push(`/workflows/approvals/${approval._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add missing icon imports
import { FileText, User, Calendar, Plane } from 'lucide-react';