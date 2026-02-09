'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { WorkflowType, WorkflowStatus, ApprovalRule } from '@/types/workflow';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Building, 
  Calendar,
  AlertCircle,
  History,
  Users,
  CheckSquare
} from 'lucide-react';

export default function WorkflowInstanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const {
    currentWorkflowInstance,
    getWorkflowInstanceById,
    isLoading,
  } = useWorkflowStore();
  
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      loadInstance();
    }
  }, [id]);

  const loadInstance = async () => {
    try {
      await getWorkflowInstanceById(id as string);
    } catch (error) {
      console.error('Failed to load workflow instance:', error);
    }
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.DRAFT:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case WorkflowStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case WorkflowStatus.IN_PROGRESS:
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case WorkflowStatus.APPROVED:
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case WorkflowStatus.REJECTED:
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case WorkflowStatus.CANCELLED:
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case WorkflowStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  const getApprovalRuleLabel = (rule: ApprovalRule) => {
    return rule.replace('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading workflow instance...</p>
      </div>
    );
  }

  if (!currentWorkflowInstance) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600">Workflow Not Found</h2>
        <p className="text-gray-600">The requested workflow instance could not be found</p>
        <Button className="mt-4" onClick={() => router.push('/workflows/configurations/instances')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Instances
        </Button>
      </div>
    );
  }

  const {
    workflowDefinition,
    initiatedByUser,
    entity,
    approvals,
    comments,
    currentStage,
    status,
    createdAt,
    initiatedAt,
    completedAt,
    initialData,
    metadata
  } = currentWorkflowInstance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/workflows/configurations/instances')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Instances
          </Button>
          <div className="flex items-start gap-4">
            <div className="text-3xl">
              {getWorkflowTypeIcon(currentWorkflowInstance.workflowType)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-requesta-primary">
                {getWorkflowTypeLabel(currentWorkflowInstance.workflowType)}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(status)}
                <span className="text-gray-600">
                  #{currentWorkflowInstance._id.substring(0, 8)}
                </span>
                <span className="text-gray-600">
                  • Created {formatDate(createdAt, 'display')}
                </span>
              </div>
            </div>
          </div>
          {initialData?.title && (
            <p className="text-lg text-gray-700 mt-2">{initialData.title}</p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_APPROVE) && 
           status === WorkflowStatus.PENDING && (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push(`/workflows/configurations/instances/${id}/approve`)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          
          {hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_REJECT) && 
           status === WorkflowStatus.PENDING && (
            <Button 
              variant="destructive"
              onClick={() => router.push(`/workflows/configurations/instances/${id}/reject`)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          )}
          
          {hasPermission(PERMISSIONS.WORKFLOW_INSTANCES_CANCEL) && 
           [WorkflowStatus.PENDING, WorkflowStatus.IN_PROGRESS].includes(status) && (
            <Button 
              variant="outline"
              onClick={() => {
                if (confirm('Are you sure you want to cancel this workflow?')) {
                  // Handle cancel logic
                }
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-1 ${activeTab === 'details' ? 'border-b-2 border-requesta-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('details')}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Details
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'approval-history' ? 'border-b-2 border-requesta-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('approval-history')}
        >
          <History className="h-4 w-4 inline mr-2" />
          Approval History
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'comments' ? 'border-b-2 border-requesta-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('comments')}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Comments ({comments?.length || 0})
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'stages' ? 'border-b-2 border-requesta-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stages')}
        >
          <CheckSquare className="h-4 w-4 inline mr-2" />
          Stages
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>Information about this workflow request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {initialData && Object.keys(initialData).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(initialData).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No additional details available</p>
              )}
            </CardContent>
          </Card>

          {/* Approval History or Comments */}
          {activeTab === 'approval-history' && (
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
                <CardDescription>Record of all approval actions</CardDescription>
              </CardHeader>
              <CardContent>
                {approvals && approvals.length > 0 ? (
                  <div className="space-y-4">
                    {approvals.map((approval, index) => (
                      <div key={approval._id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          {approval.action === 'APPROVED' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : approval.action === 'REJECTED' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {approval.approver?.fullName || 'Unknown Approver'}
                            </p>
                            <span className="text-sm text-gray-500">
                              {formatDate(approval.approvedAt, 'displayWithTime')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Stage {approval.stage + 1}: {approval.action}
                          </p>
                          {approval.comments && (
                            <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                              {approval.comments}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No approval history yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'comments' && (
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
                <CardDescription>Discussion about this workflow</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Comments implementation */}
              </CardContent>
            </Card>
          )}

          {activeTab === 'stages' && workflowDefinition && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Stages</CardTitle>
                <CardDescription>Progress through workflow stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowDefinition.stages.map((stage, index) => (
                    <div 
                      key={stage.stage} 
                      className={`p-4 border rounded-lg ${index === currentStage ? 'border-requesta-primary bg-requesta-primary/5' : ''} ${index < currentStage ? 'border-green-200 bg-green-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${index < currentStage ? 'bg-green-100 text-green-800' : index === currentStage ? 'bg-requesta-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{stage.name}</p>
                            <p className="text-sm text-gray-600">
                              {getApprovalRuleLabel(stage.approvalRule)}
                            </p>
                          </div>
                        </div>
                        <div>
                          {index < currentStage && (
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          )}
                          {index === currentStage && (
                            <Badge className="bg-requesta-primary text-white">Current</Badge>
                          )}
                          {index > currentStage && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                      </div>
                      {stage.approvers && stage.approvers.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium text-gray-600">Approvers:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {stage.approvers.map((approverId, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {approverId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Initiator</p>
                  <p className="font-medium">{initiatedByUser?.fullName || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{initiatedByUser?.email || 'No email'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Department</p>
                  <p className="font-medium">{entity?.department?.departmentName || 'No department'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Initiated</p>
                  <p className="font-medium">{formatDate(initiatedAt, 'display')}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(initiatedAt, 'displayWithTime').split(', ')[1]}
                  </p>
                </div>
              </div>
              
              {completedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="font-medium">{formatDate(completedAt, 'display')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Definition Info */}
          {workflowDefinition && (
            <Card>
              <CardHeader>
                <CardTitle>Workflow Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Template Name</p>
                  <p className="font-medium">{workflowDefinition.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Version</p>
                  <p className="font-mono">v{workflowDefinition.version}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stages</p>
                  <p className="font-medium">{workflowDefinition.stages.length}</p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => router.push(`/workflows/configurations/definitions/${workflowDefinition._id}`)}
                >
                  View Template Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Stage Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Current Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stage {currentStage + 1} of {workflowDefinition?.stages?.length || 1}</span>
                  <span>{Math.round((currentStage + 1) / (workflowDefinition?.stages?.length || 1) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-requesta-primary rounded-full"
                    style={{ 
                      width: `${((currentStage + 1) / (workflowDefinition?.stages?.length || 1)) * 100}%` 
                    }}
                  />
                </div>
                {workflowDefinition?.stages[currentStage] && (
                  <p className="text-sm text-gray-600 mt-2">
                    Awaiting approval from: {getApprovalRuleLabel(workflowDefinition.stages[currentStage].approvalRule)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
