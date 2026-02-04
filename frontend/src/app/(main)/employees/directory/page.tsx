'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployeeStore } from '@/store/slices/employee-slice'
import { getInitials } from '@/lib/utils'
import { UserPlus, Search, Filter, Eye, UserCheck, UserX } from 'lucide-react'

export default function EmployeeDirectoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    employees,
    pagination,
    filters,
    isLoading,
    fetchEmployees,
    setFilters,
  } = useEmployeeStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    loadEmployees()
  }, [pagination.page, selectedDepartment, selectedStatus])

  const loadEmployees = async () => {
    try {
      await fetchEmployees({
        page: pagination.page,
        limit: pagination.limit,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const handleSearch = () => {
    setFilters({ search: searchTerm })
    loadEmployees()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedDepartment('all')
    setSelectedStatus('all')
    setFilters({})
    loadEmployees()
  }

  const handleViewEmployee = (employeeId: string) => {
    router.push(`/employees/profiles/${employeeId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inactive</Badge>
      case 'SUSPENDED':
        return <Badge variant="destructive">Suspended</Badge>
      case 'TERMINATED':
        return <Badge variant="outline">Terminated</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSystemAccessBadge = (hasAccess: boolean) => {
    return hasAccess ? (
      <div className="flex items-center gap-1">
        <UserCheck className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">Active</span>
      </div>
    ) : (
      <div className="flex items-center gap-1">
        <UserX className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No Access</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Employee Directory</h1>
          <p className="text-gray-600">Manage and view all employees in the organization</p>
        </div>
        <Button 
          onClick={() => router.push('/employees/onboarding')}
          className="bg-requesta-primary hover:bg-requesta-primary-light"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or employee number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="HR">Human Resources</SelectItem>
                  <SelectItem value="FIN">Finance</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="TECH">Technical</SelectItem>
                  <SelectItem value="COMM">Commercial</SelectItem>
                  <SelectItem value="PROC">Procurement</SelectItem>
                  <SelectItem value="LEGAL">Legal</SelectItem>
                  <SelectItem value="EXEC">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>
            Showing {employees.length} of {pagination.total} employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No employees found</div>
              <Button 
                onClick={() => router.push('/employees/onboarding')}
                variant="outline"
              >
                Add your first employee
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>System Access</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(`${employee.firstName} ${employee.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{employee.employeeNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.departmentId?.departmentCode || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.positionId?.positionTitle || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.employmentStatus)}</TableCell>
                      <TableCell>{getSystemAccessBadge(employee.hasSystemAccess)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewEmployee(employee._id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrevPage || isLoading}
                    onClick={() => fetchEmployees({ page: pagination.page - 1 })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNextPage || isLoading}
                    onClick={() => fetchEmployees({ page: pagination.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}