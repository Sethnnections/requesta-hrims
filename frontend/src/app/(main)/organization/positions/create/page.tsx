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
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { Department, Grade, Position } from '@/types/organization'
import { organizationService } from '@/services/api/organization-service'

const positionSchema = z.object({
  positionTitle: z.string().min(2, 'Position title is required'),
  positionCode: z.string().min(2, 'Position code is required'),
  departmentId: z.string().min(1, 'Department is required'),
  gradeId: z.string().min(1, 'Grade is required'),
  reportsToPositionId: z.string().optional(),
  jobDescription: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  isHeadOfDepartment: z.boolean().default(false),
  isSupervisorRole: z.boolean().default(false),
  isManagerRole: z.boolean().default(false),
  isDirectorRole: z.boolean().default(false),
  numberOfPositions: z.number().min(1, 'At least 1 position is required'),
})

type PositionFormData = z.infer<typeof positionSchema>

export default function CreatePositionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [responsibilities, setResponsibilities] = useState<string[]>([])
  const [newResponsibility, setNewResponsibility] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      numberOfPositions: 1,
      responsibilities: [],
    },
  })

  const departmentId = watch('departmentId')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (departmentId) {
      loadDepartmentPositions(departmentId)
    }
  }, [departmentId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [deptsData, gradesData] = await Promise.all([
        organizationService.getDepartments({ 
          isActive: true,
          limit: 100 
        }),
        organizationService.getGrades({ 
          isActive: true,
          limit: 100 
        })
      ])
      
      setDepartments(deptsData.data)
      setGrades(gradesData.data)
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

  const loadDepartmentPositions = async (deptId: string) => {
    try {
      const data = await organizationService.getPositions({ 
        departmentId: deptId,
        isActive: true,
        limit: 100,
        includeRelations: true
      })
      setPositions(data.data)
    } catch (error: any) {
      console.error('Failed to load positions:', error)
    }
  }

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()])
      setValue('responsibilities', [...responsibilities, newResponsibility.trim()])
      setNewResponsibility('')
    }
  }

  const removeResponsibility = (index: number) => {
    const updated = [...responsibilities]
    updated.splice(index, 1)
    setResponsibilities(updated)
    setValue('responsibilities', updated)
  }

  const onSubmit = async (data: PositionFormData) => {
    try {
      setIsSubmitting(true)
      
      const positionData = {
        ...data,
        responsibilities: responsibilities,
        reportsToPositionId: data.reportsToPositionId || undefined,
        jobDescription: data.jobDescription || undefined,
      }

      await organizationService.createPosition(positionData)

      toast({
        title: 'Success',
        description: 'Position created successfully',
      })

      router.push('/organization/positions')
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
          <h1 className="text-3xl font-bold tracking-tight">Create Position</h1>
          <p className="text-muted-foreground">Add a new job position to your organization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
              <CardDescription>
                Enter the details for the new position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="positionTitle">Position Title *</Label>
                  <Input
                    id="positionTitle"
                    placeholder="e.g., Senior Software Engineer"
                    {...register('positionTitle')}
                  />
                  {errors.positionTitle && (
                    <p className="text-sm text-red-500">{errors.positionTitle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positionCode">Position Code *</Label>
                  <Input
                    id="positionCode"
                    placeholder="e.g., IT-DEV-SE-001"
                    {...register('positionCode')}
                  />
                  {errors.positionCode && (
                    <p className="text-sm text-red-500">{errors.positionCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department *</Label>
                  <Select onValueChange={(value) => setValue('departmentId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.departmentName} ({dept.departmentCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.departmentId && (
                    <p className="text-sm text-red-500">{errors.departmentId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradeId">Grade *</Label>
                  <Select onValueChange={(value) => setValue('gradeId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade._id} value={grade._id}>
                          {grade.name} ({grade.code}) - Level {grade.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gradeId && (
                    <p className="text-sm text-red-500">{errors.gradeId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportsToPositionId">Reports To Position</Label>
                  <Select onValueChange={(value) => setValue('reportsToPositionId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reporting position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Top-level)</SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos._id} value={pos._id}>
                          {pos.positionTitle} ({pos.positionCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfPositions">Number of Positions *</Label>
                  <Input
                    id="numberOfPositions"
                    type="number"
                    min="1"
                    {...register('numberOfPositions', { valueAsNumber: true })}
                  />
                  {errors.numberOfPositions && (
                    <p className="text-sm text-red-500">{errors.numberOfPositions.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Describe the position's responsibilities and requirements..."
                    {...register('jobDescription')}
                    rows={4}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Responsibilities</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a responsibility..."
                        value={newResponsibility}
                        onChange={(e) => setNewResponsibility(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                      />
                      <Button type="button" onClick={addResponsibility}>
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {responsibilities.map((resp, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span>{resp}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeResponsibility(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      {responsibilities.length === 0 && (
                        <p className="text-sm text-muted-foreground">No responsibilities added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Role Settings</CardTitle>
              <CardDescription>
                Configure the position's role type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Head of Department</Label>
                    <p className="text-sm text-muted-foreground">
                      This position heads the department
                    </p>
                  </div>
                  <Switch
                    onCheckedChange={(checked) => setValue('isHeadOfDepartment', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Supervisor Role</Label>
                    <p className="text-sm text-muted-foreground">
                      This position supervises other employees
                    </p>
                  </div>
                  <Switch
                    onCheckedChange={(checked) => setValue('isSupervisorRole', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Manager Role</Label>
                    <p className="text-sm text-muted-foreground">
                      This position has managerial responsibilities
                    </p>
                  </div>
                  <Switch
                    onCheckedChange={(checked) => setValue('isManagerRole', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Director Role</Label>
                    <p className="text-sm text-muted-foreground">
                      This is an executive director position
                    </p>
                  </div>
                  <Switch
                    onCheckedChange={(checked) => setValue('isDirectorRole', checked)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
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
                    {isSubmitting ? 'Creating...' : 'Create Position'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}