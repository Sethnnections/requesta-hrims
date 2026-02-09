import {
  WorkflowInstance,
  WorkflowDefinition,
  Delegation,
  CreateWorkflowInstanceData,
  CreateWorkflowDefinitionData,
  UpdateWorkflowDefinitionData,
  ApprovalActionData,
  CreateDelegationData,
  WorkflowTypeOption,
  PaginatedResponse,
  WorkflowType
} from '@/types/workflow';

export class WorkflowService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // ==================== Workflow Instances ====================

async getWorkflowInstancesByDepartment(params?: {
  page?: number;
  limit?: number;
  status?: string;
  workflowType?: WorkflowType;
}): Promise<PaginatedResponse<WorkflowInstance>> {
  const token = localStorage.getItem('accessToken');
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await fetch(`${this.baseUrl}/workflow-instances/department?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch department workflow instances');
  }

  return response.json();
}

// Create a new workflow instance
  async createWorkflowInstance(data: CreateWorkflowInstanceData): Promise<WorkflowInstance> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create workflow instance');
    }

    return response.json();
  }

  // Get all workflow instances (for admin)
  async getAllWorkflowInstances(params?: {
    page?: number;
    limit?: number;
    status?: string;
    workflowType?: WorkflowType;
    department?: string;
    search?: string;
    initiatedBy?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<WorkflowInstance>> {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/workflow-instances?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workflow instances');
    }

    return response.json();
  }

  // Get workflow instances for current user
  async getMyWorkflows(params?: {
    initiatedByMe?: boolean;
    status?: string;
    workflowType?: WorkflowType;
  }): Promise<WorkflowInstance[]> {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/workflow-instances/my-workflows?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch my workflows');
    }

    return response.json();
  }

  // Get pending approvals for current user
  async getPendingApprovals(): Promise<WorkflowInstance[]> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/pending-approvals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending approvals');
    }

    return response.json();
  }

  // Get workflow instance by ID
  async getWorkflowInstanceById(id: string): Promise<WorkflowInstance> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch workflow instance');
    }

    return response.json();
  }

  // Approve workflow instance
  async approveWorkflowInstance(id: string, data: ApprovalActionData): Promise<WorkflowInstance> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/${id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve workflow instance');
    }

    return response.json();
  }

  // Reject workflow instance
  async rejectWorkflowInstance(id: string, data: ApprovalActionData): Promise<WorkflowInstance> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/${id}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject workflow instance');
    }

    return response.json();
  }

  // Delegate workflow instance
  async delegateWorkflowInstance(id: string, delegateeId: string): Promise<WorkflowInstance> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/${id}/delegate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delegateeId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delegate workflow instance');
    }

    return response.json();
  }

  // Cancel workflow instance
  async cancelWorkflowInstance(id: string): Promise<WorkflowInstance> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel workflow instance');
    }

    return response.json();
  }

  // ==================== Delegations ====================

  async createDelegation(data: CreateDelegationData): Promise<Delegation> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/delegations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create delegation');
    }

    return response.json();
  }

  async getActiveDelegations(): Promise<Delegation[]> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/delegations/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active delegations');
    }

    return response.json();
  }

  async revokeDelegation(id: string): Promise<void> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-instances/delegations/${id}/revoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to revoke delegation');
    }
  }

  // ==================== Workflow Definitions ====================

  async createWorkflowDefinition(data: CreateWorkflowDefinitionData): Promise<WorkflowDefinition> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create workflow definition');
    }

    return response.json();
  }

  async getWorkflowDefinitions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    workflowType?: WorkflowType;
  }): Promise<PaginatedResponse<WorkflowDefinition>> {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/workflow-definitions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workflow definitions');
    }

    return response.json();
  }

  async searchWorkflowDefinitions(params?: {
    search?: string;
    isActive?: boolean;
    workflowType?: WorkflowType;
  }): Promise<WorkflowDefinition[]> {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/workflow-definitions/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search workflow definitions');
    }

    return response.json();
  }

  async getWorkflowDefinitionById(id: string): Promise<WorkflowDefinition> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch workflow definition');
    }

    return response.json();
  }

  async updateWorkflowDefinition(id: string, data: UpdateWorkflowDefinitionData): Promise<WorkflowDefinition> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update workflow definition');
    }

    return response.json();
  }

  async deleteWorkflowDefinition(id: string): Promise<void> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete workflow definition');
    }
  }

  async activateWorkflowDefinition(id: string): Promise<WorkflowDefinition> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions/${id}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate workflow definition');
    }

    return response.json();
  }

  async deactivateWorkflowDefinition(id: string): Promise<WorkflowDefinition> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions/${id}/deactivate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deactivate workflow definition');
    }

    return response.json();
  }

  async getWorkflowDefinitionVersions(id: string): Promise<WorkflowDefinition[]> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions/${id}/versions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch workflow definition versions');
    }

    return response.json();
  }

  async getAvailableWorkflowTypes(): Promise<WorkflowTypeOption[]> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions/types/available`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available workflow types');
    }

    const data = await response.json();
    return data.types || [];
  }

  async getActiveWorkflowDefinitionByType(workflowType: WorkflowType): Promise<WorkflowDefinition | null> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/workflow-definitions/active/${workflowType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch active workflow definition');
    }

    return response.json();
  }


}

export const workflowService = new WorkflowService();