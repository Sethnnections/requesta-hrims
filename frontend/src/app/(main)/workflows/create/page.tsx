'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/store/slices/workflow-slice';
import { useAuth } from '@/hooks/auth/use-auth';
import { useEmployeeStore } from '@/store/slices/employee-slice';
import { PERMISSIONS } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { WorkflowType, WorkflowStatus } from '@/types/workflow';

export default function CreateWorkflowPage() {
  const router = useRouter();
  const { user, hasPermission, canCreateWorkflowInstance } = useAuth();
  const { currentEmployee } = useEmployeeStore();
  const { 
    createWorkflowInstance, 
    getAvailableWorkflowTypes,
    getActiveWorkflowDefinitionByType,
    availableWorkflowTypes,
    isLoading 
  } = useWorkflowStore();
  
  const [formData, setFormData] = useState({
    workflowType: '' as WorkflowType,
    workflowDefinitionId: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    entityType: 'EMPLOYEE',
    entityId: '',
    initialData: {} as Record<string, any>,
    metadata: {} as Record<string, any>,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableTypes, setAvailableTypes] = useState<Array<{value: string, label: string, description: string}>>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user?.employeeId) {
      setFormData(prev => ({
        ...prev,
        entityId: user.employeeId
      }));
    }
  }, [user]);

  const loadData = async () => {
    try {
      await getAvailableWorkflowTypes();
      
      // Filter available types based on user's specific permissions
      const filteredTypes = availableWorkflowTypes.filter(type => {
        // Check specific permissions for each workflow type
        switch(type.value) {
          case WorkflowType.LEAVE_REQUEST:
            return hasPermission(PERMISSIONS.REQUESTS_CREATE);
          case WorkflowType.LOAN_APPLICATION:
            return hasPermission(PERMISSIONS.LOANS_APPROVE) || hasPermission(PERMISSIONS.REQUESTS_CREATE);
          case WorkflowType.TRAVEL_REQUEST:
            return hasPermission(PERMISSIONS.TRAVEL_APPROVE) || hasPermission(PERMISSIONS.REQUESTS_CREATE);
          case WorkflowType.OVERTIME_CLAIM:
            return hasPermission(PERMISSIONS.OVERTIME_APPROVE) || hasPermission(PERMISSIONS.REQUESTS_CREATE);
          case WorkflowType.PAYROLL_APPROVAL:
            return hasPermission(PERMISSIONS.PAYROLL_MANAGE);
          default:
            return hasPermission(PERMISSIONS.REQUESTS_CREATE);
        }
      });
      
      setAvailableTypes(filteredTypes);
    } catch (error) {
      console.error('Failed to load workflow types:', error);
    }
  };

  useEffect(() => {
    if (formData.workflowType) {
      loadWorkflowDefinition(formData.workflowType);
    }
  }, [formData.workflowType]);

  const loadWorkflowDefinition = async (workflowType: WorkflowType) => {
    try {
      const definition = await getActiveWorkflowDefinitionByType(workflowType);
      if (definition) {
        setFormData(prev => ({
          ...prev,
          workflowDefinitionId: definition._id
        }));
      }
    } catch (error) {
      console.error('Failed to load workflow definition:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.workflowType) newErrors.workflowType = 'Workflow type is required';
    if (!formData.title) newErrors.title = 'Title is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const workflowData = {
        workflowDefinitionId: formData.workflowDefinitionId,
        workflowType: formData.workflowType,
        entityType: formData.entityType,
        entityId: formData.entityId || user?.employeeId || '',
        initialData: {
          ...formData.initialData,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          requesterId: user?._id,
          requesterName: user?.username,
          requesterEmail: user?.email,
          department: currentEmployee?.departmentId?.departmentName,
          position: currentEmployee?.positionId?.positionTitle,
          grade: currentEmployee?.gradeId?.name,
        },
        metadata: {
          ...formData.metadata,
          createdBy: user?._id,
          createdByName: user?.username,
          createdAt: new Date().toISOString(),
        }
      };

      const createdWorkflow = await createWorkflowInstance(workflowData);
      
      // Redirect to the created workflow
      router.push(`/workflows/configurations/instances/${createdWorkflow._id}`);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create workflow' });
    }
  };

  const renderWorkflowTypeForm = () => {
    switch(formData.workflowType) {
      case WorkflowType.LEAVE_REQUEST:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  type="date"
                  id="startDate"
                  required
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    initialData: { ...prev.initialData, startDate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  type="date"
                  id="endDate"
                  required
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    initialData: { ...prev.initialData, endDate: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="leaveDays">Number of Days *</Label>
              <Input
                type="number"
                id="leaveDays"
                required
                min="1"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, leaveDays: parseInt(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select 
                required
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, leaveType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                  <SelectItem value="SICK">Sick Leave</SelectItem>
                  <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                  <SelectItem value="PATERNITY">Paternity Leave</SelectItem>
                  <SelectItem value="STUDY">Study Leave</SelectItem>
                  <SelectItem value="COMPASSIONATE">Compassionate Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                required
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, reason: e.target.value }
                }))}
              />
            </div>
          </div>
        );
      
      case WorkflowType.LOAN_APPLICATION:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="loanAmount">Loan Amount *</Label>
              <Input
                type="number"
                id="loanAmount"
                required
                min="1"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, amount: parseFloat(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="repaymentMonths">Repayment Period (Months) *</Label>
              <Select 
                required
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, repaymentMonths: parseInt(value) }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select repayment period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                  <SelectItem value="36">36 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea
                id="purpose"
                required
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, purpose: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="loanType">Loan Type *</Label>
              <Select 
                required
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, loanType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMERGENCY">Emergency Loan</SelectItem>
                  <SelectItem value="EDUCATION">Education Loan</SelectItem>
                  <SelectItem value="HOUSING">Housing Loan</SelectItem>
                  <SelectItem value="VEHICLE">Vehicle Loan</SelectItem>
                  <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case WorkflowType.TRAVEL_REQUEST:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="travelStartDate">Travel Start Date *</Label>
                <Input
                  type="date"
                  id="travelStartDate"
                  required
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    initialData: { ...prev.initialData, startDate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="travelEndDate">Travel End Date *</Label>
                <Input
                  type="date"
                  id="travelEndDate"
                  required
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    initialData: { ...prev.initialData, endDate: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                required
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, destination: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="purpose">Purpose of Travel *</Label>
              <Textarea
                id="purpose"
                required
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, purpose: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="estimatedCost">Estimated Cost *</Label>
              <Input
                type="number"
                id="estimatedCost"
                required
                min="0"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, estimatedCost: parseFloat(e.target.value) }
                }))}
              />
            </div>
          </div>
        );
      
      case WorkflowType.OVERTIME_CLAIM:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="overtimeDate">Overtime Date *</Label>
              <Input
                type="date"
                id="overtimeDate"
                required
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, overtimeDate: e.target.value }
                }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  type="time"
                  id="startTime"
                  required
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    initialData: { ...prev.initialData, startTime: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  type="time"
                  id="endTime"
                  required
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    initialData: { ...prev.initialData, endTime: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="hours">Total Hours *</Label>
              <Input
                type="number"
                id="hours"
                required
                min="0.5"
                step="0.5"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, hours: parseFloat(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Overtime *</Label>
              <Textarea
                id="reason"
                required
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, reason: e.target.value }
                }))}
              />
            </div>
          </div>
        );
      
      // Add more workflow types as needed
      
      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="details">Details *</Label>
              <Textarea
                id="details"
                required
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialData: { ...prev.initialData, details: e.target.value }
                }))}
              />
            </div>
          </div>
        );
    }
  };

  if (!canCreateWorkflowInstance) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to create workflows</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Create New Workflow</h1>
          <p className="text-gray-600">Start a new approval process</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
            <CardDescription>Enter the details for your workflow request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="workflowType">Workflow Type *</Label>
                <Select 
                  value={formData.workflowType}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    workflowType: value as WorkflowType,
                    // Clear previous specific data when changing type
                    initialData: {}
                  }))}
                  disabled={isLoading || availableTypes.length === 0}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.workflowType && (
                  <p className="text-sm text-red-600 mt-1">{errors.workflowType}</p>
                )}
                {availableTypes.length === 0 && !isLoading && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No workflow types available based on your permissions
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive title for your request"
                  required
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your request in detail..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Requester Info (Read-only) */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Requester Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{user?.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{user?.email}</span>
                  </div>
                  {currentEmployee && (
                    <>
                      <div>
                        <span className="text-gray-600">Department:</span>
                        <span className="ml-2 font-medium">{currentEmployee.departmentId?.departmentName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Position:</span>
                        <span className="ml-2 font-medium">{currentEmployee.positionId?.positionTitle}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Workflow type specific fields */}
              {formData.workflowType && renderWorkflowTypeForm()}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.workflowType || !formData.title}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}