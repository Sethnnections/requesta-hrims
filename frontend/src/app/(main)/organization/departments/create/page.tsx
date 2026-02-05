'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { Department, Position } from '@/types/organization'
import { organizationService } from '@/services/api/organization-service'

const departmentSchema = z.object({
  departmentName: z.string().min(2, 'Department name is required'),
  departmentCode: z.string().min(2, 'Department code is required'),
  description: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  departmentHeadPositionId: z.string().optional(),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

export default function CreateDepartmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [deptsData, positionsData] = await Promise.all([
        organizationService.getDepartments({ 
          isActive: true,
          limit: 100 
        }),
        organizationService.getPositions({ 
          isActive: true,
          limit: 100,
          includeRelations: true 
        })
      ])
      
      setDepartments(deptsData.data)
      setPositions(positionsData.data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      setIsSubmitting(true)
      await organizationService.createDepartment(data)

      toast({
        title: 'Success',
        description: 'Department created successfully',
      })

      router.push('/organization/departments')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold tracking-tight">Create Department</h1>
          <p className="text-muted-foreground">Add a new department to your organization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Department Details</CardTitle>
            <CardDescription>
              Enter the details for the new department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departmentName">Department Name *</Label>
                <Input
                  id="departmentName"
                  placeholder="e.g., Human Resources"
                  {...register('departmentName')}
                />
                {errors.departmentName && (
                  <p className="text-sm text-red-500">{errors.departmentName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentCode">Department Code *</Label>
                <Input
                  id="departmentCode"
                  placeholder="e.g., HR-001"
                  {...register('departmentCode')}
                />
                {errors.departmentCode && (
                  <p className="text-sm text-red-500">{errors.departmentCode.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the department's purpose and responsibilities..."
                  {...register('description')}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentDepartmentId">Parent Department</Label>
                <Select onValueChange={(value) => setValue('parentDepartmentId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Top-level)</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.departmentName} ({dept.departmentCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentHeadPositionId">Department Head Position</Label>
                <Select onValueChange={(value) => setValue('departmentHeadPositionId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {positions
                      .filter(pos => pos.isManagerRole || pos.isDirectorRole)
                      .map((pos) => (
                        <SelectItem key={pos._id} value={pos._id}>
                          {pos.positionTitle} ({pos.positionCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Creating...' : 'Create Department'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}