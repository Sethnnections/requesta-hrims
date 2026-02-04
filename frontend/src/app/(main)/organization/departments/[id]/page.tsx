'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building,
  Users,
  Calendar,
  User,
  ArrowLeft,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Map,
  Layers,
  Home,
} from 'lucide-react'
import { Department } from '@/types/organization/department'

export default function DepartmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [department, setDepartment] = useState<Department | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDepartment()
  }, [params.id])

  const fetchDepartment = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/v1/departments/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      
      if (!response.ok) throw new Error('Failed to fetch department')
      
      const data = await response.json()
      setDepartment(data)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading department details...</p>
        </div>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold">Department not found</h3>
          <p className="mt-2 text-muted-foreground">
            The department you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/organization/departments')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Departments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{department.departmentName}</h1>
            <p className="text-muted-foreground">
              Department Code: {department.departmentCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={department.isActive ? 'default' : 'destructive'} className="text-sm">
            {department.isActive ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
          <Button variant="outline" onClick={() => router.push(`/organization/departments/${params.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Department Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Code</p>
                    <p className="font-semibold">{department.departmentCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={department.isActive ? 'default' : 'destructive'}>
                      {department.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="mt-1">{department.description || 'No description provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Department Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{department.employeeCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Sub-departments</p>
                    <p className="text-2xl font-bold">{department.subDepartments?.length || 0}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(department.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {department.parentDepartment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Parent Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Building className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{department.parentDepartment.departmentName}</p>
                      <p className="text-sm text-muted-foreground">{department.parentDepartment.departmentCode}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => router.push(`/organization/departments/${department.parentDepartment?._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {department.departmentHeadPosition && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Department Head
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{department.departmentHeadPosition.positionTitle}</p>
                      <p className="text-sm text-muted-foreground">{department.departmentHeadPosition.positionCode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Department Hierarchy
              </CardTitle>
              <CardDescription>
                View the organizational structure of this department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Hierarchy visualization will go here */}
                <div className="text-center py-8 text-muted-foreground">
                  <Map className="h-12 w-12 mx-auto mb-4" />
                  <p>Hierarchy visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}