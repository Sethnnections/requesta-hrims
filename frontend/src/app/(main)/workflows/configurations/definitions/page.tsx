
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Eye, ToggleLeft, ToggleRight, Trash2, Search, Filter, FileText, AlertCircle } from 'lucide-react';
import { WorkflowType } from '@/types/workflow';

export default function WorkflowDefinitionsPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const {
    workflowDefinitions,
    getWorkflowDefinitions,
    deleteWorkflowDefinition,
    activateWorkflowDefinition,
    deactivateWorkflowDefinition,
    isLoading,
    error,
  } = useWorkflowStore();
  
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');

  useEffect(() => {
    loadDefinitions();
  }, []);

  useEffect(() => {
    loadDefinitions();
  }, [search, filterActive]);

  const loadDefinitions = async () => {
    if (hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_VIEW)) {
      try {
        await getWorkflowDefinitions({
          search: search || undefined,
          isActive: filterActive === 'all' ? undefined : filterActive === 'active',
        });
      } catch (err) {
        console.error('Failed to load definitions:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow definition?')) {
      try {
        await deleteWorkflowDefinition(id);
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete workflow definition. Please try again.');
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateWorkflowDefinition(id);
      } else {
        await activateWorkflowDefinition(id);
      }
    } catch (error) {
      console.error('Failed to toggle:', error);
      alert('Failed to update workflow status. Please try again.');
    }
  };

  const canCreate = hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_CREATE);
  const canEdit = hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_EDIT);
  const canDelete = hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_DELETE);
  const canToggle = hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_ACTIVATE);

  if (!hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_VIEW)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view workflow definitions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Workflow Definitions</h1>
          <p className="text-gray-600">Manage workflow templates and approval processes</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push('/workflows/configurations/definitions/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Definition
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <p className="font-medium">Error: {error}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-red-600 border-red-200 hover:bg-red-100"
            onClick={loadDefinitions}
          >
            Retry
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Definitions</CardTitle>
              <CardDescription>
                Configure approval workflows for different processes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search definitions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-requesta-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading definitions...</p>
            </div>
          ) : !workflowDefinitions || workflowDefinitions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No workflow definitions found</h3>
              <p className="text-gray-600">
                {search ? 'Try a different search term' : 'Create your first workflow definition to get started'}
              </p>
              {canCreate && (
                <Button className="mt-4" onClick={() => router.push('/workflows/configurations/definitions/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Definition
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Stages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowDefinitions.map((definition) => (
                    <TableRow key={definition._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {definition.name || 'Unnamed Definition'}
                        </div>
                        {definition.description && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                            {definition.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {(definition.workflowType || '').replace('_', ' ').toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{definition.department || 'All'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{(definition.stages || []).length}</span>
                          <span className="text-gray-400">stages</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          definition.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }>
                          {definition.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        v{definition.version || '1.0'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/workflows/configurations/definitions/${definition._id}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/workflows/configurations/definitions/${definition._id}/edit`)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canToggle && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleActive(definition._id, definition.isActive || false)}
                              title={definition.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {definition.isActive ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-600" />
                              )}
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(definition._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
