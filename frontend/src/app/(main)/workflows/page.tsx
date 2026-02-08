'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  FileText, 
  Settings, 
  Users, 
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function WorkflowsPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { 
    pendingApprovals, 
    myWorkflows, 
    getPendingApprovals, 
    getMyWorkflows,
    isLoading 
  } = useWorkflowStore();
  
  const [stats, setStats] = useState({
    pending: 0,
    myRequests: 0,
    completed: 0,
    teamRequests: 0,
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      await Promise.all([
        getPendingApprovals(),
        getMyWorkflows({ initiatedByMe: true }),
        getMyWorkflows({ initiatedByMe: false }),
      ]);

      // Calculate stats
      const myRequests = myWorkflows.filter(w => w.initiatedBy === user?._id);
      const teamRequests = myWorkflows.filter(w => w.initiatedBy !== user?._id);
      const completed = myRequests.filter(w => 
        w.status === 'APPROVED' || w.status === 'REJECTED' || w.status === 'CANCELLED'
      ).length;

      setStats({
        pending: pendingApprovals.length,
        myRequests: myRequests.length,
        completed,
        teamRequests: teamRequests.length,
      });
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const canViewDefinitions = hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_VIEW);
  const canViewApprovals = hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_APPROVE);
  const canCreateInstance = hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_CREATE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Workflows</h1>
          <p className="text-gray-600">Manage approvals, requests, and workflow configurations</p>
        </div>
        {canCreateInstance && (
          <Button onClick={() => router.push('/workflows/create')}>
            <FileText className="h-4 w-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <h3 className="text-2xl font-bold mt-2">{stats.pending}</h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/workflows/approvals')}
              disabled={!canViewApprovals}
            >
              View All
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Requests</p>
                <h3 className="text-2xl font-bold mt-2">{stats.myRequests}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/workflows/my-requests')}
            >
              View All
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Requests</p>
                <h3 className="text-2xl font-bold mt-2">{stats.teamRequests}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/workflows/team-requests')}
              disabled={!hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_VIEW_TEAM)}
            >
              View All
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <h3 className="text-2xl font-bold mt-2">{stats.completed}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/workflows/completed')}
            >
              View All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common workflow management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => router.push('/workflows/approvals')}
              disabled={!canViewApprovals}
            >
              <Clock className="h-8 w-8" />
              <span>Review Approvals</span>
              {stats.pending > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => router.push('/workflows/create')}
              disabled={!canCreateInstance}
            >
              <FileText className="h-8 w-8" />
              <span>Create New Request</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => router.push('/workflows/configurations/definitions')}
              disabled={!canViewDefinitions}
            >
              <Settings className="h-8 w-8" />
              <span>Workflow Configurations</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest workflow actions</CardDescription>
            </div>
            <Button variant="ghost" onClick={loadWorkflows}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : myWorkflows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent workflow activity
            </div>
          ) : (
            <div className="space-y-4">
              {myWorkflows.slice(0, 5).map((workflow) => (
                <div
                  key={workflow._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-medium">
                      {workflow.workflowType.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Status: <span className="font-medium">{workflow.status}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(workflow.initiatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/workflows/configurations/instances/${workflow._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}