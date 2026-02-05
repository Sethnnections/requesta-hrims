'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { Plus, Search, Filter, Building, Users, MoreVertical, Eye, Edit, Trash, CheckCircle, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { Department, PaginatedResponse } from '@/types/organization'
import { organizationService } from '@/services/api/organization-service'

// Define columns with proper typing
const columns: ColumnDef<Department>[] = [
  {
    accessorKey: 'departmentCode',
    header: 'Code',
  },
  {
    accessorKey: 'departmentName',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="max-w-xs truncate">{row.original.description || '-'}</div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'destructive'} className="flex items-center gap-1">
        {row.original.isActive ? (
          <>
            <CheckCircle className="h-3 w-3" />
            Active
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3" />
            Inactive
          </>
        )}
      </Badge>
    ),
  },
  {
    accessorKey: 'employeeCount',
    header: 'Employees',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4" />
        <span>{row.original.employeeCount || 0}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const department = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <ViewDetailsMenuItem departmentId={department._id} />
            <EditMenuItem departmentId={department._id} />
            <DropdownMenuSeparator />
            <DeleteMenuItem departmentId={department._id} departmentName={department.departmentName} />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Separate components for menu items
function ViewDetailsMenuItem({ departmentId }: { departmentId: string }) {
  const router = useRouter()
  return (
    <DropdownMenuItem onClick={() => router.push(`/organization/departments/${departmentId}`)}>
      <Eye className="mr-2 h-4 w-4" />
      View Details
    </DropdownMenuItem>
  )
}

function EditMenuItem({ departmentId }: { departmentId: string }) {
  const router = useRouter()
  return (
    <DropdownMenuItem onClick={() => router.push(`/organization/departments/${departmentId}/edit`)}>
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
  )
}

function DeleteMenuItem({ departmentId, departmentName }: { departmentId: string; departmentName: string }) {
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${departmentName}"?`)) return
    
    try {
      await organizationService.deleteDepartment(departmentId)
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  return (
    <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
      <Trash className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  )
}

export default function DepartmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchDepartments = async (page = 1) => {
    try {
      setIsLoading(true)
      const data = await organizationService.getDepartments({
        page,
        limit: pagination.limit,
        search,
        isActive: true,
        includeEmployeeCount: true,
        includeSubDepartments: true,
      })
      
      setDepartments(data.data)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [search])

  const handlePageChange = (page: number) => {
    fetchDepartments(page)
  }

  const totalEmployees = departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0)
  const activeDepartments = departments.filter(d => d.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage your organization's departments and hierarchy
          </p>
        </div>
        <Button onClick={() => router.push('/organization/departments/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Departments</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                className="pl-8 w-[250px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department List</CardTitle>
              <CardDescription>
                A list of all departments in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={departments}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
                exportable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              {activeDepartments} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hierarchy Levels</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.some(d => d.subDepartments && d.subDepartments.length > 0) ? '3+' : '1'}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum depth in structure
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}