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
import { 
  Plus, 
  Edit, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Search, 
  Filter, 
  FileText, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw
} from 'lucide-react';
import { WorkflowType } from '@/types/workflow';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

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
    pagination,
  } = useWorkflowStore();
  
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Load definitions when filters or pagination changes
  useEffect(() => {
    loadDefinitions();
  }, [debouncedSearch, filterActive, page, limit]);

  const loadDefinitions = async () => {
    if (hasPermission(PERMISSIONS.WORKFLOW_DEFINITIONS_VIEW)) {
      try {
        await getWorkflowDefinitions({
          page,
          limit,
          search: debouncedSearch || undefined,
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
        // Reload definitions after deletion
        loadDefinitions();
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
      // Reload definitions after status change
      loadDefinitions();
    } catch (error) {
      console.error('Failed to toggle:', error);
      alert('Failed to update workflow status. Please try again.');
    }
  };

  // Pagination functions
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number(newLimit));
    setPage(1); // Reset to first page when changing limit
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Workflow Definitions</h1>
          <p className="text-gray-600">Manage workflow templates and approval processes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDefinitions}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canCreate && (
            <Button onClick={() => router.push('/workflows/configurations/definitions/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Definition
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Definitions</p>
                <p className="text-2xl font-bold text-blue-900">{pagination.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Definitions</p>
                <p className="text-2xl font-bold text-green-900">
                  {workflowDefinitions.filter(d => d.isActive).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                <ToggleRight className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Page Info</p>
                <p className="text-2xl font-bold text-purple-900">
                  {page}/{pagination.totalPages}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                <ChevronsRight className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-red-200 bg-red-50 rounded-md"
        >
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
        </motion.div>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Definitions</CardTitle>
              <CardDescription>
                Showing {workflowDefinitions.length} of {pagination.total} definitions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search definitions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full md:w-64"
                />
              </div>
              <Select
                value={filterActive}
                onValueChange={setFilterActive}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
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
                {debouncedSearch ? 'Try a different search term' : 'Create your first workflow definition to get started'}
              </p>
              {canCreate && (
                <Button className="mt-4" onClick={() => router.push('/workflows/configurations/definitions/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Definition
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Stages</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflowDefinitions.map((definition, index) => (
                      <motion.tr
                        key={definition._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{definition.name || 'Unnamed Definition'}</span>
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
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{definition.department || 'All'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{(definition.stages || []).length}</span>
                            <span className="text-gray-400 text-sm">stages</span>
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
                        <TableCell className="font-mono text-sm">
                          v{definition.version || '1.0'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/workflows/configurations/definitions/${definition._id}`)}
                              title="View Details"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/workflows/configurations/definitions/${definition._id}/edit`)}
                                title="Edit"
                                className="h-8 w-8 p-0"
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
                                className="h-8 w-8 p-0"
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
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <Select
                    value={limit.toString()}
                    onValueChange={handleLimitChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">entries per page</span>
                </div>

                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total}</span> entries
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={page === 1 || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1 || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 mx-2">
                    {(() => {
                      const pages = [];
                      const totalPages = pagination.totalPages;
                      const currentPage = page;
                      
                      // Always show first page
                      pages.push(
                        <Button
                          key={1}
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(1)}
                          className="h-8 w-8 p-0"
                        >
                          1
                        </Button>
                      );
                      
                      // Show ellipsis if needed
                      if (currentPage > 3) {
                        pages.push(
                          <span key="ellipsis1" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      
                      // Show pages around current page
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                        if (i === 1 || i === totalPages) continue;
                        pages.push(
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(i)}
                            className="h-8 w-8 p-0"
                          >
                            {i}
                          </Button>
                        );
                      }
                      
                      // Show ellipsis if needed
                      if (currentPage < totalPages - 2) {
                        pages.push(
                          <span key="ellipsis2" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      
                      // Always show last page if there's more than 1 page
                      if (totalPages > 1) {
                        pages.push(
                          <Button
                            key={totalPages}
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(totalPages)}
                            className="h-8 w-8 p-0"
                          >
                            {totalPages}
                          </Button>
                        );
                      }
                      
                      return pages;
                    })()}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={page === pagination.totalPages || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.totalPages)}
                    disabled={page === pagination.totalPages || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={loadDefinitions}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Refresh Data</p>
                <p className="text-sm text-gray-500">Reload current view</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => router.push('/workflows/configurations/definitions/create')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Plus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Create New</p>
                <p className="text-sm text-gray-500">Add workflow definition</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                {/* //Download className="h-5 w-5 text-purple-600" /> */}
              </div>
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-gray-500">Download as CSV/Excel</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Filter className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Advanced Filter</p>
                <p className="text-sm text-gray-500">More filter options</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}