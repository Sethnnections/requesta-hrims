
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { WorkflowType, ApprovalRule, UpdateWorkflowDefinitionData, WorkflowStage } from '@/types/workflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, ArrowLeft, Save, AlertCircle } from 'lucide-react';

const DEFAULT_RULE_CONFIGS = {
  [ApprovalRule.SUPERVISOR]: { requiresDirectSupervisor: true },
  [ApprovalRule.DEPARTMENT_HEAD]: { departmentLevel: 'head' },
  [ApprovalRule.HR_MANAGER]: { role: 'hr_manager' },
  [ApprovalRule.FINANCE_MANAGER]: { role: 'finance_manager' },
  [ApprovalRule.SYSTEM_ADMIN]: { role: 'system_admin' },
  [ApprovalRule.SPECIFIC_USER]: { userIds: [] },
  [ApprovalRule.ROLE_BASED]: { roles: [] },
  [ApprovalRule.ANY_MANAGER]: { managerLevel: 'any' },
};

export default function EditWorkflowDefinitionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const {
    currentWorkflowDefinition,
    getWorkflowDefinitionById,
    updateWorkflowDefinition,
    getAvailableWorkflowTypes,
    availableWorkflowTypes,
    isLoading,
    error,
  } = useWorkflowStore();
  
  const [formData, setFormData] = useState<UpdateWorkflowDefinitionData>({
    name: '',
    workflowType: WorkflowType.LEAVE_REQUEST,
    department: '',
    description: '',
    stages: [
      {
        stage: 0,
        name: 'Initial Approval',
        approvalRule: ApprovalRule.SUPERVISOR,
        ruleConfig: DEFAULT_RULE_CONFIGS[ApprovalRule.SUPERVISOR],
      }
    ],
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    if (id) {
      loadDefinition();
      loadWorkflowTypes();
    }
  }, [id]);

  const loadDefinition = async () => {
    try {
      await getWorkflowDefinitionById(id as string);
    } catch (error) {
      console.error('Failed to load definition:', error);
    } finally {
      setIsLoadingPage(false);
    }
  };

  const loadWorkflowTypes = async () => {
    try {
      await getAvailableWorkflowTypes();
    } catch (error) {
      console.error('Failed to load workflow types:', error);
    }
  };

  useEffect(() => {
    if (currentWorkflowDefinition) {
      setFormData({
        name: currentWorkflowDefinition.name || '',
        workflowType: currentWorkflowDefinition.workflowType || WorkflowType.LEAVE_REQUEST,
        department: currentWorkflowDefinition.department || '',
        description: currentWorkflowDefinition.description || '',
        stages: currentWorkflowDefinition.stages || [
          {
            stage: 0,
            name: 'Initial Approval',
            approvalRule: ApprovalRule.SUPERVISOR,
            ruleConfig: DEFAULT_RULE_CONFIGS[ApprovalRule.SUPERVISOR],
          }
        ],
        isActive: currentWorkflowDefinition.isActive !== undefined ? currentWorkflowDefinition.isActive : true,
      });
    }
  }, [currentWorkflowDefinition]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.workflowType) {
      errors.workflowType = 'Workflow type is required';
    }

    if (!formData.stages || formData.stages.length === 0) {
      errors.stages = 'At least one approval stage is required';
    } else {
      formData.stages.forEach((stage, index) => {
        if (!stage.name?.trim()) {
          errors[`stage_${index}_name`] = `Stage ${index + 1} name is required`;
        }
        if (!stage.approvalRule) {
          errors[`stage_${index}_rule`] = `Stage ${index + 1} approval rule is required`;
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_EDIT)) {
      alert('You do not have permission to edit workflow definitions');
      return;
    }

    try {
      // Prepare the data for API
      const submissionData: UpdateWorkflowDefinitionData = {
        ...formData,
        stages: formData.stages?.map((stage, index) => ({
          ...stage,
          stage: index, // Ensure sequential stage numbers
        })),
      };

      await updateWorkflowDefinition(id as string, submissionData);
      alert('Workflow definition updated successfully!');
      router.push('/workflows/configurations/definitions');
    } catch (error: any) {
      console.error('Failed to update workflow definition:', error);
      alert(`Failed to update workflow definition: ${error.message || 'Unknown error'}`);
    }
  };

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [
        ...(prev.stages || []),
        {
          stage: (prev.stages || []).length,
          name: `Stage ${(prev.stages || []).length + 1}`,
          approvalRule: ApprovalRule.SUPERVISOR,
          ruleConfig: DEFAULT_RULE_CONFIGS[ApprovalRule.SUPERVISOR],
        }
      ]
    }));
  };

  const removeStage = (index: number) => {
    if ((formData.stages || []).length <= 1) {
      alert('At least one stage is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      stages: (prev.stages || []).filter((_, i) => i !== index).map((stage, i) => ({
        ...stage,
        stage: i,
      }))
    }));
  };

  const updateStage = (index: number, field: keyof WorkflowStage, value: any) => {
    setFormData(prev => ({
      ...prev,
      stages: (prev.stages || []).map((stage, i) => {
        if (i === index) {
          const updatedStage = { ...stage, [field]: value };
          
          // When approval rule changes, update ruleConfig
          if (field === 'approvalRule') {
            updatedStage.ruleConfig = DEFAULT_RULE_CONFIGS[value as ApprovalRule] || {};
          }
          
          return updatedStage;
        }
        return stage;
      })
    }));
  };

  if (isLoadingPage) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading workflow definition...</p>
      </div>
    );
  }

  if (!hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_EDIT)) {
    return (
      <div className="p-8 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to edit workflow definitions.
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={() => router.push('/workflows/configurations/definitions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Definitions
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentWorkflowDefinition) {
    return (
      <div className="p-8 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Workflow definition not found.
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={() => router.push('/workflows/configurations/definitions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Definitions
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/workflows/configurations/definitions')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Definitions
          </Button>
          <h1 className="text-3xl font-bold text-requesta-primary">
            Edit Workflow Definition
          </h1>
          <p className="text-gray-600">
            Update workflow: {currentWorkflowDefinition.name}
            <span className="ml-2 font-mono text-sm text-gray-500">
              v{currentWorkflowDefinition.version}
            </span>
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update the basic properties of your workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Leave Request Approval"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workflowType">Workflow Type *</Label>
                  <Select
                    value={formData.workflowType}
                    onValueChange={(value) => setFormData({...formData, workflowType: value as WorkflowType})}
                  >
                    <SelectTrigger className={formErrors.workflowType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select workflow type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkflowTypes && availableWorkflowTypes.length > 0 ? (
                        availableWorkflowTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))
                      ) : (
                        Object.values(WorkflowType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ').toLowerCase()
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.workflowType && (
                    <p className="text-sm text-red-500">{formErrors.workflowType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    placeholder="e.g., HR, Finance, IT"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                  <p className="text-sm text-gray-500">Leave empty for organization-wide workflow</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this workflow..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-gray-500 ml-2">
                    {formData.isActive 
                      ? 'This workflow will be available for use immediately' 
                      : 'This workflow will be inactive and cannot be used'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Approval Stages Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Approval Stages</CardTitle>
                    <CardDescription>Update the approval sequence for this workflow</CardDescription>
                  </div>
                  <Button type="button" onClick={addStage} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stage
                  </Button>
                </div>
                {formErrors.stages && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.stages}</AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              <CardContent>
                {!formData.stages || formData.stages.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500">No stages defined. Add your first approval stage.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.stages.map((stage, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-requesta-primary text-white flex items-center justify-center">
                              {index + 1}
                            </div>
                            <h3 className="font-semibold">Stage {index + 1}</h3>
                          </div>
                          {(formData.stages || []).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStage(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`stage-${index}-name`}>Stage Name *</Label>
                            <Input
                              id={`stage-${index}-name`}
                              placeholder="e.g., Supervisor Approval, HR Review"
                              value={stage.name || ''}
                              onChange={(e) => updateStage(index, 'name', e.target.value)}
                              className={formErrors[`stage_${index}_name`] ? 'border-red-500' : ''}
                            />
                            {formErrors[`stage_${index}_name`] && (
                              <p className="text-sm text-red-500">{formErrors[`stage_${index}_name`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`stage-${index}-rule`}>Approval Rule *</Label>
                            <Select
                              value={stage.approvalRule}
                              onValueChange={(value) => updateStage(index, 'approvalRule', value as ApprovalRule)}
                            >
                              <SelectTrigger className={formErrors[`stage_${index}_rule`] ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select approval rule" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(ApprovalRule).map((rule) => (
                                  <SelectItem key={rule} value={rule}>
                                    {rule.replace('_', ' ').toLowerCase()
                                      .split(' ')
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                      .join(' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors[`stage_${index}_rule`] && (
                              <p className="text-sm text-red-500">{formErrors[`stage_${index}_rule`]}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              {getRuleDescription(stage.approvalRule)}
                            </p>
                          </div>

                          {/* Rule-specific configuration */}
                          {stage.approvalRule === ApprovalRule.SPECIFIC_USER && (
                            <div className="space-y-2">
                              <Label>Specific Users</Label>
                              <Input
                                placeholder="Enter user IDs (comma-separated)"
                                value={Array.isArray(stage.ruleConfig?.userIds) ? stage.ruleConfig.userIds.join(', ') : ''}
                                onChange={(e) => updateStage(index, 'ruleConfig', {
                                  ...stage.ruleConfig,
                                  userIds: e.target.value.split(',').map(id => id.trim())
                                })}
                              />
                            </div>
                          )}

                          {stage.approvalRule === ApprovalRule.ROLE_BASED && (
                            <div className="space-y-2">
                              <Label>Required Roles</Label>
                              <Input
                                placeholder="Enter roles (comma-separated)"
                                value={Array.isArray(stage.ruleConfig?.roles) ? stage.ruleConfig.roles.join(', ') : ''}
                                onChange={(e) => updateStage(index, 'ruleConfig', {
                                  ...stage.ruleConfig,
                                  roles: e.target.value.split(',').map(role => role.trim())
                                })}
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`stage-${index}-minApprovals`}>Minimum Approvals</Label>
                              <Input
                                id={`stage-${index}-minApprovals`}
                                type="number"
                                min="1"
                                max="10"
                                placeholder="1"
                                value={stage.minApprovals || 1}
                                onChange={(e) => updateStage(index, 'minApprovals', parseInt(e.target.value) || 1)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`stage-${index}-autoApproveAfter`}>Auto-approve After (hours)</Label>
                              <Input
                                id={`stage-${index}-autoApproveAfter`}
                                type="number"
                                min="0"
                                placeholder="0 (no auto-approval)"
                                value={stage.autoApproveAfter || ''}
                                onChange={(e) => updateStage(index, 'autoApproveAfter', e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Version</p>
                  <p className="font-mono">v{currentWorkflowDefinition.version}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Workflow Name</p>
                  <p className="font-medium">{formData.name || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="font-medium">
                    {formData.workflowType 
                      ? formData.workflowType.replace('_', ' ').toLowerCase()
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                      : 'Not selected'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Department</p>
                  <p className="font-medium">{formData.department || 'All Departments'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stages</p>
                  <p className="font-medium">{(formData.stages || []).length}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Workflow Definition
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/workflows/configurations/definitions')}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    // Reset to original data
                    setFormData({
                      name: currentWorkflowDefinition.name || '',
                      workflowType: currentWorkflowDefinition.workflowType || WorkflowType.LEAVE_REQUEST,
                      department: currentWorkflowDefinition.department || '',
                      description: currentWorkflowDefinition.description || '',
                      stages: currentWorkflowDefinition.stages || [
                        {
                          stage: 0,
                          name: 'Initial Approval',
                          approvalRule: ApprovalRule.SUPERVISOR,
                          ruleConfig: DEFAULT_RULE_CONFIGS[ApprovalRule.SUPERVISOR],
                        }
                      ],
                      isActive: currentWorkflowDefinition.isActive !== undefined ? currentWorkflowDefinition.isActive : true,
                    });
                    setFormErrors({});
                  }}
                >
                  Reset Changes
                </Button>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle>Editing Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Editing creates a new version of the workflow</p>
                <p>• Existing instances continue with the old version</p>
                <p>• New instances will use the updated version</p>
                <p>• Review changes carefully before saving</p>
                <p>• Test the workflow after making changes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

// Helper function to get rule descriptions
function getRuleDescription(rule: ApprovalRule): string {
  switch (rule) {
    case ApprovalRule.SUPERVISOR:
      return 'Approval required from the requester\'s direct supervisor';
    case ApprovalRule.DEPARTMENT_HEAD:
      return 'Approval required from the department head';
    case ApprovalRule.HR_MANAGER:
      return 'Approval required from HR manager';
    case ApprovalRule.FINANCE_MANAGER:
      return 'Approval required from finance manager';
    case ApprovalRule.SYSTEM_ADMIN:
      return 'Approval required from system administrator';
    case ApprovalRule.SPECIFIC_USER:
      return 'Approval required from specific users';
    case ApprovalRule.ROLE_BASED:
      return 'Approval required from users with specific roles';
    case ApprovalRule.ANY_MANAGER:
      return 'Approval required from any manager in the department';
    default:
      return 'Approval rule description not available';
  }
}
