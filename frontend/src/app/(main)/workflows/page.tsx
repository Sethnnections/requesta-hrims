'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  FileText, 
  Settings, 
  Users, 
  Clock,
  AlertCircle,
  ListTodo,
  PlayCircle,
  Search,
  Filter,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { WorkflowType, WorkflowStatus } from '@/types/workflow';

export default function WorkflowsPage() {
  const router = useRouter();
  const { 
    user, 
    hasPermission,
    canCreateWorkflowInstance,
    canViewAllWorkflowInstances,
    canViewDepartmentWorkflowInstances,
    canViewTeamWorkflowInstances,
    canAccessWorkflowDefinitions,
    canAccessWorkflowApprovals
  } = useAuth();
  const { 
    pendingApprovals, 
    myWorkflows, 
    workflowInstances,
    getPendingApprovals, 
    getMyWorkflows,
    getWorkflowDefinitions,
    isLoading 
  } = useWorkflowStore();
  
  const [stats, setStats] = useState({
    pending: 0,
    myRequests: 0,
    completed: 0,
    teamRequests: 0,
    inProgress: 0,
    rejected: 0,
    drafts: 0,
    total: 0
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWorkflows, setFilteredWorkflows] = useState(myWorkflows);

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    filterWorkflows();
  }, [searchQuery, myWorkflows]);

  const loadWorkflows = async () => {
    try {
      // Load based on user permissions
      if (canAccessWorkflowApprovals()) {
        await getPendingApprovals();
      }
      
      // Load user's workflows
      await getMyWorkflows({ initiatedByMe: true });
      
      // Load all workflows if user has permission
      if (canViewAllWorkflowInstances()) {
        // You'll need to add a method to get all workflows
        // await getAllWorkflows();
      }

      // Calculate stats
      const myRequests = myWorkflows.filter(w => w.initiatedBy === user?._id);
      const teamRequests = myWorkflows.filter(w => w.initiatedBy !== user?._id);
      const pending = pendingApprovals.length;
      const completed = myRequests.filter(w => 
        w.status === WorkflowStatus.APPROVED || w.status === WorkflowStatus.COMPLETED
      ).length;
      const inProgress = myRequests.filter(w => 
        w.status === WorkflowStatus.IN_PROGRESS || w.status === WorkflowStatus.PENDING
      ).length;
      const rejected = myRequests.filter(w => w.status === WorkflowStatus.REJECTED).length;
      const drafts = myRequests.filter(w => w.status === WorkflowStatus.DRAFT).length;

      setStats({
        pending,
        myRequests: myRequests.length,
        completed,
        teamRequests: teamRequests.length,
        inProgress,
        rejected,
        drafts,
        total: myWorkflows.length
      });
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const filterWorkflows = () => {
    if (!searchQuery) {
      setFilteredWorkflows(myWorkflows);
      return;
    }
    
    const filtered = myWorkflows.filter(workflow => {
      const searchLower = searchQuery.toLowerCase();
      return (
        workflow.workflowType.toLowerCase().includes(searchLower) ||
        workflow.initiatedByUser?.fullName?.toLowerCase().includes(searchLower) ||
        workflow.status.toLowerCase().includes(searchLower) ||
        workflow.initialData?.title?.toLowerCase().includes(searchLower) ||
        workflow.initialData?.description?.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredWorkflows(filtered);
  };

  const getWorkflowTypeIcon = (type: WorkflowType) => {
    switch(type) {
      case WorkflowType.LEAVE_REQUEST: return '📋';
      case WorkflowType.LOAN_APPLICATION: return '💰';
      case WorkflowType.TRAVEL_REQUEST: return '✈️';
      case WorkflowType.OVERTIME_CLAIM: return '⏰';
      case WorkflowType.PAYROLL_APPROVAL: return '💳';
      case WorkflowType.EXPENSE_CLAIM: return '🧾';
      case WorkflowType.RECRUITMENT: return '👥';
      case WorkflowType.PERFORMANCE_REVIEW: return '📊';
      case WorkflowType.EMPLOYEE_REGISTRATION: return '👤';
      default: return '📄';
    }
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

  // Determine what tabs user can see
  const canSeeAllWorkflows = canViewAllWorkflowInstances;
  const canSeeTeamWorkflows = canViewTeamWorkflowInstances || canViewDepartmentWorkflowInstances;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Workflow Management</h1>
          <p className="text-gray-600">Manage all workflow processes, approvals, and configurations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {canCreateWorkflowInstance() && (
            <Button onClick={() => router.push('/workflows/create')}>
              <PlayCircle className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          )}
          {canAccessWorkflowDefinitions() && (
            <Button variant="outline" onClick={() => router.push('/workflows/configurations/definitions')}>
              <Settings className="h-4 w-4 mr-2" />
              Definitions
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search workflows by type, name, status, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals Card */}
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <h3 className="text-2xl font-bold mt-2">{stats.pending}</h3>
                <p className="text-xs text-gray-500 mt-1">Awaiting your action</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/workflows/approvals')}
              disabled={!canAccessWorkflowApprovals}
            >
              Review All
            </Button>
          </CardContent>
        </Card>

        {/* My Active Requests Card */}
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Active Requests</p>
                <h3 className="text-2xl font-bold mt-2">{stats.inProgress}</h3>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ListTodo className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/workflows/my-workflows')}
            >
              View My Requests
            </Button>
          </CardContent>
        </Card>

        {/* Completed Card */}
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <h3 className="text-2xl font-bold mt-2">{stats.completed}</h3>
                <p className="text-xs text-gray-500 mt-1">Approved/Completed</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/workflows/completed')}
            >
              View History
            </Button>
          </CardContent>
        </Card>

        {/* Team Requests Card - only show if user can view team workflows */}
        {canSeeTeamWorkflows() && (
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Requests</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.teamRequests}</h3>
                  <p className="text-xs text-gray-500 mt-1">From your team/department</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => router.push('/workflows/team-workflows')}
              >
                Manage Team
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending" disabled={!canAccessWorkflowApprovals}>
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="my-workflows">My Workflows ({stats.myRequests})</TabsTrigger>
          {canSeeTeamWorkflows() && (
            <TabsTrigger value="team">Team ({stats.teamRequests})</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common workflow management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 relative"
                  onClick={() => router.push('/workflows/approvals')}
                  disabled={!canAccessWorkflowApprovals}
                >
                  <AlertCircle className="h-8 w-8" />
                  <span>Review Approvals</span>
                  {stats.pending > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {stats.pending}
                    </span>
                  )}
                  {!canAccessWorkflowApprovals && (
                    <span className="text-xs text-gray-500 mt-1">No permission</span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => router.push('/workflows/create')}
                  disabled={!canCreateWorkflowInstance}
                >
                  <PlayCircle className="h-8 w-8" />
                  <span>Start New Workflow</span>
                  {!canCreateWorkflowInstance && (
                    <span className="text-xs text-gray-500 mt-1">No permission</span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => router.push('/workflows/configurations/definitions')}
                  disabled={!canAccessWorkflowDefinitions}
                >
                  <Settings className="h-8 w-8" />
                  <span>Configure Workflows</span>
                  {!canAccessWorkflowDefinitions && (
                    <span className="text-xs text-gray-500 mt-1">No permission</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent workflow actions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={loadWorkflows}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading workflows...</p>
                </div>
              ) : filteredWorkflows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No workflows match your search' : 'No recent workflow activity'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWorkflows.slice(0, 10).map((workflow) => (
                    <div
                      key={workflow._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/workflows/configurations/instances/${workflow._id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getWorkflowTypeIcon(workflow.workflowType)}</span>
                        <div>
                          <h4 className="font-medium">
                            {getWorkflowTypeLabel(workflow.workflowType)}
                            {workflow.initialData?.title && `: ${workflow.initialData.title}`}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(workflow.status)}>
                              {workflow.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {workflow.initiatedByUser?.fullName || 'Unknown'}
                            </span>
                            <span className="text-sm text-gray-400">
                              • {new Date(workflow.initiatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Stage {workflow.currentStage + 1}/{workflow.workflowDefinition?.stages?.length || 1}
                        </p>
                        <p className="text-xs text-gray-400">
                          {workflow.entity?.department?.departmentName || 'No department'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                {stats.pending} request{stats.pending !== 1 ? 's' : ''} awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canAccessWorkflowApprovals ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Access Denied</h3>
                  <p className="text-gray-600">You don't have permission to view pending approvals</p>
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">All caught up!</h3>
                  <p className="text-gray-600">No pending approvals at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <Card key={approval._id} className="border-l-4 border-l-yellow-500 hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">
                                {getWorkflowTypeIcon(approval.workflowType)}
                              </span>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {getWorkflowTypeLabel(approval.workflowType)}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  From: {approval.initiatedByUser?.fullName || 'Unknown'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {approval.initialData?.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(approval.status)}>
                                {approval.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Stage {approval.currentStage + 1}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/workflows/approvals/${approval._id}`)}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Workflows Tab */}
        <TabsContent value="my-workflows">
          <Card>
            <CardHeader>
              <CardTitle>My Workflow Requests</CardTitle>
              <CardDescription>
                {stats.myRequests} total • {stats.inProgress} in progress • {stats.completed} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading your workflows...</p>
                </div>
              ) : filteredWorkflows.filter(w => w.initiatedBy === user?._id).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No workflows found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try a different search' : 'You haven\'t created any workflow requests yet'}
                  </p>
                  {canCreateWorkflowInstance() && (
                    <Button className="mt-4" onClick={() => router.push('/workflows/create')}>
                      Create Your First Request
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredWorkflows
                    .filter(w => w.initiatedBy === user?._id)
                    .map((workflow) => (
                      <Card key={workflow._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">
                                  {getWorkflowTypeIcon(workflow.workflowType)}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {getWorkflowTypeLabel(workflow.workflowType)}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Status: <Badge className={getStatusColor(workflow.status)}>
                                      {workflow.status}
                                    </Badge>
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {workflow.initialData?.description || 'No description'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-3">
                              <div className="text-sm text-gray-500">
                                Created: {new Date(workflow.initiatedAt).toLocaleDateString()}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/workflows/configurations/instances/${workflow._id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Workflows Tab */}
        {canSeeTeamWorkflows() && (
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Workflows</CardTitle>
                <CardDescription>
                  Workflows from your team or department
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading team workflows...</p>
                  </div>
                ) : filteredWorkflows.filter(w => w.initiatedBy !== user?._id).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No team workflows</h3>
                    <p className="text-gray-600">
                      No workflow requests from your team or department
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredWorkflows
                      .filter(w => w.initiatedBy !== user?._id)
                      .map((workflow) => (
                        <Card key={workflow._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">
                                    {getWorkflowTypeIcon(workflow.workflowType)}
                                  </span>
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {getWorkflowTypeLabel(workflow.workflowType)}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      From: {workflow.initiatedByUser?.fullName || 'Unknown'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Status: <Badge className={getStatusColor(workflow.status)}>
                                        {workflow.status}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row items-center gap-3">
                                <div className="text-sm text-gray-500">
                                  {new Date(workflow.initiatedAt).toLocaleDateString()}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/workflows/configurations/instances/${workflow._id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}