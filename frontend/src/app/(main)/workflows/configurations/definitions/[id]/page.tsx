'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { WorkflowType, ApprovalRule } from '@/types/workflow';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  ArrowLeft, 
  Edit, 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  Building,
  Layers,
  Zap,
  Activity,
  TrendingUp,
  Shield,
  AlertTriangle,
  Info,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Copy,
  Download,
  Share2,
  MoreVertical,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function WorkflowDefinitionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const {
    currentWorkflowDefinition,
    getWorkflowDefinitionById,
    activateWorkflowDefinition,
    deactivateWorkflowDefinition,
    isLoading,
    error,
  } = useWorkflowStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'history' | 'usage'>('overview');
  const [isActivating, setIsActivating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadDefinition();
    }
  }, [id]);

  const loadDefinition = async () => {
    try {
      await getWorkflowDefinitionById(id as string);
    } catch (error) {
      console.error('Failed to load definition:', error);
    }
  };

  const handleToggleActive = async () => {
    if (!currentWorkflowDefinition) return;
    
    setIsActivating(true);
    try {
      if (currentWorkflowDefinition.isActive) {
        await deactivateWorkflowDefinition(currentWorkflowDefinition._id);
        setSuccessMessage('Workflow deactivated successfully!');
      } else {
        await activateWorkflowDefinition(currentWorkflowDefinition._id);
        setSuccessMessage('Workflow activated successfully!');
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadDefinition(); // Reload to get updated state
    } catch (error) {
      console.error('Failed to toggle workflow status:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const canEdit = hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_EDIT);
  const canDelete = hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_DELETE);
  const canToggle = hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_ACTIVATE);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <motion.div
              className="h-16 w-16 rounded-full border-4 border-requesta-primary/20 border-t-requesta-primary mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-8 w-8 text-requesta-primary" />
            </div>
          </div>
          <p className="text-gray-600">Loading workflow definition...</p>
        </div>
      </div>
    );
  }

  if (error || !currentWorkflowDefinition) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          {error ? 'Error loading workflow' : 'Workflow not found'}
        </h2>
        <p className="text-gray-600 mb-4">
          {error || 'The requested workflow definition could not be found.'}
        </p>
        <Button 
          variant="outline"
          onClick={() => router.push('/workflows/configurations/definitions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Definitions
        </Button>
      </div>
    );
  }

  const getWorkflowTypeIcon = (type: WorkflowType) => {
    switch (type) {
      case WorkflowType.LEAVE_REQUEST: return '🌴';
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

  const getWorkflowTypeColor = (type: WorkflowType) => {
    switch (type) {
      case WorkflowType.LEAVE_REQUEST: return 'bg-blue-100 text-blue-800';
      case WorkflowType.LOAN_APPLICATION: return 'bg-green-100 text-green-800';
      case WorkflowType.TRAVEL_REQUEST: return 'bg-purple-100 text-purple-800';
      case WorkflowType.OVERTIME_CLAIM: return 'bg-amber-100 text-amber-800';
      case WorkflowType.PAYROLL_APPROVAL: return 'bg-indigo-100 text-indigo-800';
      case WorkflowType.EXPENSE_CLAIM: return 'bg-rose-100 text-rose-800';
      case WorkflowType.RECRUITMENT: return 'bg-cyan-100 text-cyan-800';
      case WorkflowType.PERFORMANCE_REVIEW: return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRuleIcon = (rule: ApprovalRule) => {
    switch (rule) {
      case ApprovalRule.SUPERVISOR: return <Users className="h-4 w-4" />;
      case ApprovalRule.DEPARTMENT_HEAD: return <Building className="h-4 w-4" />;
      case ApprovalRule.HR_MANAGER: return <Shield className="h-4 w-4" />;
      case ApprovalRule.FINANCE_MANAGER: return <TrendingUp className="h-4 w-4" />;
      case ApprovalRule.SYSTEM_ADMIN: return <Zap className="h-4 w-4" />;
      case ApprovalRule.SPECIFIC_USER: return <Users className="h-4 w-4" />;
      case ApprovalRule.ROLE_BASED: return <Layers className="h-4 w-4" />;
      case ApprovalRule.ANY_MANAGER: return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/workflows/configurations/definitions')}
            className="h-8 w-8 p-0 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getWorkflowTypeIcon(currentWorkflowDefinition.workflowType)}</span>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentWorkflowDefinition.name}
              </h1>
              <Badge className={`ml-2 ${getWorkflowTypeColor(currentWorkflowDefinition.workflowType)}`}>
                {currentWorkflowDefinition.workflowType.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              {currentWorkflowDefinition.description || 'No description provided'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={currentWorkflowDefinition.isActive ? "outline" : "default"}
            onClick={handleToggleActive}
            disabled={isActivating || !canToggle}
            className="relative overflow-hidden"
          >
            {isActivating ? (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ) : null}
            {currentWorkflowDefinition.isActive ? (
              <>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/workflows/configurations/definitions/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(id as string)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{successMessage}</p>
                    <p className="text-sm text-green-700">Status updated successfully</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
            { id: 'stages', label: 'Stages', icon: <Layers className="h-4 w-4" /> },
            { id: 'history', label: 'History', icon: <Clock className="h-4 w-4" /> },
            { id: 'usage', label: 'Usage', icon: <Activity className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-requesta-primary text-requesta-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Workflow definition details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Workflow Type</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getWorkflowTypeIcon(currentWorkflowDefinition.workflowType)}</span>
                          <p className="font-medium">
                            {currentWorkflowDefinition.workflowType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <p className="font-medium">
                            {currentWorkflowDefinition.department || 'All Departments'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge className={
                          currentWorkflowDefinition.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }>
                          {currentWorkflowDefinition.isActive ? (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                              Active
                            </div>
                          ) : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">Version</p>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <p className="font-mono font-medium">v{currentWorkflowDefinition.version || '1.0'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {currentWorkflowDefinition.description && (
                      <div className="space-y-2 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-gray-700">{currentWorkflowDefinition.description}</p>
                      </div>
                    )}

                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-gray-700">{formatDate(currentWorkflowDefinition.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>Workflow performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">24</p>
                        <p className="text-sm text-gray-600">Active Instances</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">156</p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">3.2</p>
                        <p className="text-sm text-gray-600">Avg. Days</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">92%</p>
                        <p className="text-sm text-gray-600">Approval Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Actions & Status */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Workflow
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Definition
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {canDelete && (
                      <Button className="w-full" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Definition
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Health Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Workflow Health</p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Healthy
                        </Badge>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">All stages properly configured</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">No pending issues</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Recent activity detected</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Stages Tab */}
          {activeTab === 'stages' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Approval Stages</CardTitle>
                  <CardDescription>
                    {currentWorkflowDefinition.stages.length} stage{currentWorkflowDefinition.stages.length !== 1 ? 's' : ''} in this workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
                    
                    <div className="space-y-8">
                      {currentWorkflowDefinition.stages.map((stage, index) => (
                        <motion.div
                          key={stage.stage}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex items-start gap-4"
                        >
                          {/* Stage Number */}
                          <div className="relative z-10">
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              index === 0 ? 'bg-requesta-primary' :
                              index === currentWorkflowDefinition.stages.length - 1 ? 'bg-green-600' :
                              'bg-blue-600'
                            }`}>
                              {stage.stage}
                            </div>
                          </div>

                          {/* Stage Card */}
                          <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">{stage.name}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      Stage {stage.stage}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    {getRuleIcon(stage.approvalRule)}
                                    <span className="text-sm">
                                      {stage.approvalRule.replace('_', ' ')}
                                    </span>
                                  </div>
                                  {stage.ruleConfig && Object.keys(stage.ruleConfig).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {Object.entries(stage.ruleConfig).map(([key, value]) => (
                                        <Badge key={key} variant="secondary" className="text-xs">
                                          {key}: {value}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    <span>Min Approvals: {stage.minApprovals || 1}</span>
                                  </div>
                                  {stage.autoApproveAfter && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <AlertTriangle className="h-4 w-4" />
                                      <span>Auto-approve after {stage.autoApproveAfter} hours</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Arrow Connector */}
                          {index < currentWorkflowDefinition.stages.length - 1 && (
                            <div className="absolute left-24 top-16 bottom-0 flex items-center justify-center">
                              <ChevronRight className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stage Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Stage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-blue-700">Total Stages</p>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-bold text-blue-600">{currentWorkflowDefinition.stages.length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-green-700">Avg. Approvers</p>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="font-bold text-green-600">1.5</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-purple-700">Completion Time</p>
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="font-bold text-purple-600">3.2d</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>Previous versions of this workflow definition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Current Version (v{currentWorkflowDefinition.version})</p>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Last updated: {formatDate(currentWorkflowDefinition.updatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Previous Versions */}
                  {[1, 2, 3].map((version) => (
                    <motion.div
                      key={version}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: version * 0.1 }}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Version {currentWorkflowDefinition.version - version}</p>
                          <Badge variant="outline">Archived</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Created: {formatDate(new Date(Date.now() - version * 86400000 * 30).toISOString())}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>How this workflow is being used across the organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">1,247</p>
                      <p className="text-sm text-gray-600">Total Instances</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">92%</p>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">3.2</p>
                      <p className="text-sm text-gray-600">Avg. Days</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">24</p>
                      <p className="text-sm text-gray-600">Active Now</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item * 0.05 }}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">New instance created</p>
                          <p className="text-sm text-gray-600">
                            John Doe submitted a {currentWorkflowDefinition.workflowType.replace('_', ' ').toLowerCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">2 hours ago</p>
                          <Badge variant="outline" className="mt-1">Pending</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            size="lg"
            className="rounded-full shadow-lg h-14 w-14"
            onClick={() => router.push(`/workflows/configurations/definitions/${id}/edit`)}
          >
            <Edit className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}