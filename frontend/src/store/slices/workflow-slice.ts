import { create } from 'zustand';
import { workflowService } from '@/services/api/workflow-service';
import type {
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
  WorkflowType,
  WorkflowStatus
} from '@/types/workflow';

interface WorkflowState {
  // State
  workflowInstances: WorkflowInstance[];
  myWorkflows: WorkflowInstance[];
  pendingApprovals: WorkflowInstance[];
  currentWorkflowInstance: WorkflowInstance | null;
  workflowDefinitions: WorkflowDefinition[];
  currentWorkflowDefinition: WorkflowDefinition | null;
  delegations: Delegation[];
  availableWorkflowTypes: WorkflowTypeOption[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  
  // Filters
  filters: {
    workflowType?: WorkflowType;
    status?: WorkflowStatus;
    initiatedByMe?: boolean;
  };
  
  // Actions
  // Workflow Instances
  createWorkflowInstance: (data: CreateWorkflowInstanceData) => Promise<WorkflowInstance>;
  getMyWorkflows: (params?: {
    initiatedByMe?: boolean;
    status?: string;
    workflowType?: WorkflowType;
  }) => Promise<void>;
  getPendingApprovals: () => Promise<void>;
  getWorkflowInstanceById: (id: string) => Promise<void>;
  approveWorkflowInstance: (id: string, data: ApprovalActionData) => Promise<WorkflowInstance>;
  rejectWorkflowInstance: (id: string, data: ApprovalActionData) => Promise<WorkflowInstance>;
  cancelWorkflowInstance: (id: string) => Promise<WorkflowInstance>;
  
  // Delegations
  createDelegation: (data: CreateDelegationData) => Promise<Delegation>;
  getActiveDelegations: () => Promise<void>;
  revokeDelegation: (id: string) => Promise<void>;
  
  // Workflow Definitions
  createWorkflowDefinition: (data: CreateWorkflowDefinitionData) => Promise<WorkflowDefinition>;
  getWorkflowDefinitions: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    workflowType?: WorkflowType;
  }) => Promise<void>;
  getWorkflowDefinitionById: (id: string) => Promise<void>;
  updateWorkflowDefinition: (id: string, data: UpdateWorkflowDefinitionData) => Promise<WorkflowDefinition>;
  deleteWorkflowDefinition: (id: string) => Promise<void>;
  activateWorkflowDefinition: (id: string) => Promise<WorkflowDefinition>;
  deactivateWorkflowDefinition: (id: string) => Promise<WorkflowDefinition>;
  getWorkflowDefinitionVersions: (id: string) => Promise<WorkflowDefinition[]>;
  getAvailableWorkflowTypes: () => Promise<void>;
  getActiveWorkflowDefinitionByType: (workflowType: WorkflowType) => Promise<WorkflowDefinition | null>;
  
  // Utility
  setFilters: (filters: Partial<WorkflowState['filters']>) => void;
  clearError: () => void;
  resetState: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  workflowInstances: [],
  myWorkflows: [],
  pendingApprovals: [],
  currentWorkflowInstance: null,
  workflowDefinitions: [],
  currentWorkflowDefinition: null,
  delegations: [],
  availableWorkflowTypes: [],
  isLoading: false,
  error: null,
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  
  filters: {
    workflowType: undefined,
    status: undefined,
    initiatedByMe: undefined,
  },
  
  // Actions
  createWorkflowInstance: async (data: CreateWorkflowInstanceData) => {
    set({ isLoading: true, error: null });
    
    try {
      const workflowInstance = await workflowService.createWorkflowInstance(data);
      set({ isLoading: false });
      return workflowInstance;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getMyWorkflows: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const workflows = await workflowService.getMyWorkflows(params);
      set({ myWorkflows: workflows, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getPendingApprovals: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const approvals = await workflowService.getPendingApprovals();
      set({ pendingApprovals: approvals, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getWorkflowInstanceById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const workflowInstance = await workflowService.getWorkflowInstanceById(id);
      set({ currentWorkflowInstance: workflowInstance, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  approveWorkflowInstance: async (id: string, data: ApprovalActionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const workflowInstance = await workflowService.approveWorkflowInstance(id, data);
      
      // Update in pending approvals
      const { pendingApprovals } = get();
      set({
        pendingApprovals: pendingApprovals.filter(wf => wf._id !== id),
        isLoading: false
      });
      
      return workflowInstance;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  rejectWorkflowInstance: async (id: string, data: ApprovalActionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const workflowInstance = await workflowService.rejectWorkflowInstance(id, data);
      
      // Update in pending approvals
      const { pendingApprovals } = get();
      set({
        pendingApprovals: pendingApprovals.filter(wf => wf._id !== id),
        isLoading: false
      });
      
      return workflowInstance;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  cancelWorkflowInstance: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const workflowInstance = await workflowService.cancelWorkflowInstance(id);
      set({ isLoading: false });
      return workflowInstance;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  // Delegations
  createDelegation: async (data: CreateDelegationData) => {
    set({ isLoading: true, error: null });
    
    try {
      const delegation = await workflowService.createDelegation(data);
      set({ isLoading: false });
      return delegation;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getActiveDelegations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const delegations = await workflowService.getActiveDelegations();
      set({ delegations: delegations, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  revokeDelegation: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.revokeDelegation(id);
      
      // Remove from state
      const { delegations } = get();
      set({
        delegations: delegations.filter(d => d._id !== id),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  // Workflow Definitions
  createWorkflowDefinition: async (data: CreateWorkflowDefinitionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const definition = await workflowService.createWorkflowDefinition(data);
      set({ isLoading: false });
      return definition;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getWorkflowDefinitions: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const { page = 1, limit = 10, ...filters } = params;
      const response = await workflowService.getWorkflowDefinitions({
        page,
        limit,
        ...filters,
      });
      
      set({
        workflowDefinitions: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getWorkflowDefinitionById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const definition = await workflowService.getWorkflowDefinitionById(id);
      set({ currentWorkflowDefinition: definition, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateWorkflowDefinition: async (id: string, data: UpdateWorkflowDefinitionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const definition = await workflowService.updateWorkflowDefinition(id, data);
      
      // Update in definitions list
      const { workflowDefinitions } = get();
      set({
        workflowDefinitions: workflowDefinitions.map(wd =>
          wd._id === id ? definition : wd
        ),
        currentWorkflowDefinition: definition,
        isLoading: false
      });
      
      return definition;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  deleteWorkflowDefinition: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.deleteWorkflowDefinition(id);
      
      // Remove from state
      const { workflowDefinitions } = get();
      set({
        workflowDefinitions: workflowDefinitions.filter(wd => wd._id !== id),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  activateWorkflowDefinition: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const definition = await workflowService.activateWorkflowDefinition(id);
      
      // Update in definitions list
      const { workflowDefinitions } = get();
      set({
        workflowDefinitions: workflowDefinitions.map(wd =>
          wd._id === id ? definition : wd
        ),
        currentWorkflowDefinition: definition,
        isLoading: false
      });
      
      return definition;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  deactivateWorkflowDefinition: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const definition = await workflowService.deactivateWorkflowDefinition(id);
      
      // Update in definitions list
      const { workflowDefinitions } = get();
      set({
        workflowDefinitions: workflowDefinitions.map(wd =>
          wd._id === id ? definition : wd
        ),
        currentWorkflowDefinition: definition,
        isLoading: false
      });
      
      return definition;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getWorkflowDefinitionVersions: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const versions = await workflowService.getWorkflowDefinitionVersions(id);
      set({ isLoading: false });
      return versions;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getAvailableWorkflowTypes: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const types = await workflowService.getAvailableWorkflowTypes();
      set({ availableWorkflowTypes: types, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  getActiveWorkflowDefinitionByType: async (workflowType: WorkflowType) => {
    set({ isLoading: true, error: null });
    
    try {
      const definition = await workflowService.getActiveWorkflowDefinitionByType(workflowType);
      set({ isLoading: false });
      return definition;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  // Utility
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },
  
  clearError: () => set({ error: null }),
  
  resetState: () => set({
    workflowInstances: [],
    myWorkflows: [],
    pendingApprovals: [],
    currentWorkflowInstance: null,
    workflowDefinitions: [],
    currentWorkflowDefinition: null,
    delegations: [],
    availableWorkflowTypes: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    filters: {
      workflowType: undefined,
      status: undefined,
      initiatedByMe: undefined,
    },
  }),
}));