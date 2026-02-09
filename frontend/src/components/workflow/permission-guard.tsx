'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  anyPermission?: string[];
  fallback?: ReactNode;
  showAlert?: boolean;
}

export function PermissionGuard({
  children,
  requiredPermission,
  requiredPermissions,
  anyPermission,
  fallback,
  showAlert = true
}: PermissionGuardProps) {
  const { user, hasPermission, checkPermission } = useAuth();

  const hasRequiredPermission = () => {
    if (!user) return false;
    
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }
    
    if (requiredPermissions) {
      return requiredPermissions.every(permission => hasPermission(permission));
    }
    
    if (anyPermission) {
      return anyPermission.some(permission => hasPermission(permission));
    }
    
    return true;
  };

  if (!user || !hasRequiredPermission()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showAlert) {
      return (
        <div className="p-8">
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page.
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    return null;
  }

  return <>{children}</>;
}

// Specific workflow permission guards
export function WorkflowCreateGuard({ children }: { children: ReactNode }) {
  return (
    <PermissionGuard
      requiredPermission={PERMISSIONS.WORKFLOW_INSTANCES_CREATE}
      anyPermission={[PERMISSIONS.REQUESTS_CREATE, PERMISSIONS.SYSTEM_FULL_ACCESS]}
    >
      {children}
    </PermissionGuard>
  );
}

export function WorkflowApprovalGuard({ children }: { children: ReactNode }) {
  return (
    <PermissionGuard
      requiredPermission={PERMISSIONS.WORKFLOW_INSTANCES_APPROVE}
      anyPermission={[
        PERMISSIONS.APPROVALS_DEPARTMENT,
        PERMISSIONS.APPROVALS_TEAM,
        PERMISSIONS.APPROVALS_DIRECT_REPORTS,
        PERMISSIONS.SYSTEM_FULL_ACCESS
      ]}
    >
      {children}
    </PermissionGuard>
  );
}

export function WorkflowDefinitionGuard({ children }: { children: ReactNode }) {
  return (
    <PermissionGuard
      requiredPermission={PERMISSIONS.WORKFLOW_DEFINITIONS_VIEW}
      anyPermission={[PERMISSIONS.WORKFLOW_DEFINITIONS_MANAGE, PERMISSIONS.SYSTEM_FULL_ACCESS]}
    >
      {children}
    </PermissionGuard>
  );
}

export function TeamWorkflowGuard({ children }: { children: ReactNode }) {
  return (
    <PermissionGuard
      anyPermission={[
        PERMISSIONS.WORKFLOW_INSTANCES_VIEW_TEAM,
        PERMISSIONS.WORKFLOW_INSTANCES_VIEW_DEPARTMENT,
        PERMISSIONS.SYSTEM_FULL_ACCESS
      ]}
    >
      {children}
    </PermissionGuard>
  );
}