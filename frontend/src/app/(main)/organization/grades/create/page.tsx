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
import { Grade } from '@/types/organization'
import { organizationService } from '@/services/api/organization-service'

const gradeSchema = z.object({
  name: z.string().min(2, 'Grade name is required'),
  code: z.string().min(2, 'Grade code is required'),
  level: z.number().min(1, 'Grade level is required'),
  band: z.enum(['JUNIOR', 'OPERATIONAL', 'SUPERVISORY', 'MANAGERIAL', 'EXECUTIVE']),
  description: z.string().min(10, 'Description is required'),
  compensation: z.object({
    basicSalary: z.object({
      min: z.number().min(0, 'Minimum salary must be positive'),
      mid: z.number().min(0, 'Mid salary must be positive'),
      max: z.number().min(0, 'Maximum salary must be positive'),
    }),
    houseAllowance: z.number().min(0).default(0),
    carAllowance: z.number().min(0).default(0),
    travelAllowance: z.number().min(0).default(0),
    overtimeRate: z.number().min(1.0).default(1.0),
  }),
  limits: z.object({
    maxLoanAmount: z.number().min(0).default(0),
    requiresManagerApproval: z.boolean().default(true),
    requiresDirectorApproval: z.boolean().default(false),
    maxApprovalLevel: z.string().default('M11'),
  }).optional(),
  isActive: z.boolean().default(true),
  nextGrade: z.string().optional(),
})

type GradeFormData = z.infer<typeof gradeSchema>

export default function CreateGradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      level: 1,
      band: 'JUNIOR',
      compensation: {
        basicSalary: {
          min: 0,
          mid: 0,
          max: 0,
        },
        houseAllowance: 0,
        carAllowance: 0,
        travelAllowance: 0,
        overtimeRate: 1.0,
      },
      limits: {
        maxLoanAmount: 0,
        requiresManagerApproval: true,
        requiresDirectorApproval: false,
        maxApprovalLevel: 'M11',
      },
      isActive: true,
    },
  })

  useEffect(() => {
    loadGrades()
  }, [])

  const loadGrades = async () => {
    try {
      setIsLoading(true)
      const data = await organizationService.getGrades({ 
        isActive: true,
        limit: 100 
      })
      setGrades(data.data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load grades',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: GradeFormData) => {
    try {
      setIsSubmitting(true)
      
      // Prepare the data in the format expected by the API
      const gradeData = {
        name: data.name,
        code: data.code,
        level: data.level,
        band: data.band,
        description: data.description,
        compensation: data.compensation,
        limits: data.limits,
        isActive: data.isActive,
        nextGrade: data.nextGrade || undefined,
      }

      // TODO: Replace with actual API call when the endpoint is ready
      // For now, we'll simulate a successful creation
      console.log('Creating grade:', gradeData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: 'Success',
        description: 'Grade created successfully',
      })

      router.push('/organization/grades')
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
          <h1 className="text-3xl font-bold tracking-tight">Create Grade</h1>
          <p className="text-muted-foreground">Add a new employee grade with compensation details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of the grade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Grade Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Manager Grade 3"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Grade Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., M3"
                    {...register('code')}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Grade Level *</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    {...register('level', { valueAsNumber: true })}
                  />
                  {errors.level && (
                    <p className="text-sm text-red-500">{errors.level.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="band">Band *</Label>
                  <Select onValueChange={(value: any) => setValue('band', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select band" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JUNIOR">Junior</SelectItem>
                      <SelectItem value="OPERATIONAL">Operational</SelectItem>
                      <SelectItem value="SUPERVISORY">Supervisory</SelectItem>
                      <SelectItem value="MANAGERIAL">Managerial</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.band && (
                    <p className="text-sm text-red-500">{errors.band.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the grade level and expectations..."
                    {...register('description')}
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextGrade">Next Grade (Progression)</Label>
                  <Select onValueChange={(value) => setValue('nextGrade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select next grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {grades.map((grade) => (
                        <SelectItem key={grade._id} value={grade._id}>
                          {grade.name} ({grade.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Compensation Details</CardTitle>
              <CardDescription>
                Set salary and allowance ranges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Salary Range (MWK)</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="compensation.basicSalary.min">Minimum</Label>
                    <Input
                      id="compensation.basicSalary.min"
                      type="number"
                      {...register('compensation.basicSalary.min', { valueAsNumber: true })}
                    />
                    {errors.compensation?.basicSalary?.min && (
                      <p className="text-sm text-red-500">{errors.compensation.basicSalary.min.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compensation.basicSalary.mid">Mid-point</Label>
                    <Input
                      id="compensation.basicSalary.mid"
                      type="number"
                      {...register('compensation.basicSalary.mid', { valueAsNumber: true })}
                    />
                    {errors.compensation?.basicSalary?.mid && (
                      <p className="text-sm text-red-500">{errors.compensation.basicSalary.mid.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compensation.basicSalary.max">Maximum</Label>
                    <Input
                      id="compensation.basicSalary.max"
                      type="number"
                      {...register('compensation.basicSalary.max', { valueAsNumber: true })}
                    />
                    {errors.compensation?.basicSalary?.max && (
                      <p className="text-sm text-red-500">{errors.compensation.basicSalary.max.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Allowances (MWK)</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="compensation.houseAllowance">House Allowance</Label>
                    <Input
                      id="compensation.houseAllowance"
                      type="number"
                      {...register('compensation.houseAllowance', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compensation.carAllowance">Car Allowance</Label>
                    <Input
                      id="compensation.carAllowance"
                      type="number"
                      {...register('compensation.carAllowance', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compensation.travelAllowance">Travel Allowance</Label>
                    <Input
                      id="compensation.travelAllowance"
                      type="number"
                      {...register('compensation.travelAllowance', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compensation.overtimeRate">Overtime Rate Multiplier</Label>
                    <Input
                      id="compensation.overtimeRate"
                      type="number"
                      step="0.1"
                      {...register('compensation.overtimeRate', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Limits</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="limits.maxLoanAmount">Maximum Loan Amount (MWK)</Label>
                    <Input
                      id="limits.maxLoanAmount"
                      type="number"
                      {...register('limits.maxLoanAmount', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="limits.maxApprovalLevel">Max Approval Level</Label>
                      <Input
                        id="limits.maxApprovalLevel"
                        placeholder="e.g., M11"
                        {...register('limits.maxApprovalLevel')}
                      />
                    </div>
                  </div>
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
                    {isSubmitting ? 'Creating...' : 'Create Grade'}
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