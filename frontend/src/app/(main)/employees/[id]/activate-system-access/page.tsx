'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useEmployeeStore } from '@/store/slices/employee-slice'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const systemAccessSchema = z.object({
  systemUsername: z.string().min(3, 'Username is required'),
  systemRole: z.string().min(1, 'Role is required'),
  useEmailAsUsername: z.boolean().default(false),
})

type SystemAccessFormData = z.infer<typeof systemAccessSchema>

export default function SystemAccessActivationPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { 
    currentEmployee,
    isLoading,
    fetchEmployeeById,
    activateSystemAccess,
    getRegistrationStatus 
  } = useEmployeeStore()
  
  const employeeId = params.id as string

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SystemAccessFormData>({
    resolver: zodResolver(systemAccessSchema),
    defaultValues: {
      systemRole: 'employee',
      useEmailAsUsername: false,
    },
  })

  useEffect(() => {
    if (employeeId) {
      loadEmployee()
      checkRegistrationStatus()
    }
  }, [employeeId])

  const loadEmployee = async () => {
    try {
      await fetchEmployeeById(employeeId)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load employee data',
        variant: 'error',
      })
    }
  }

  const checkRegistrationStatus = async () => {
    try {
      const status = await getRegistrationStatus(employeeId)
      if (status.hasSystemAccess) {
        toast({
          title: 'System Access Already Activated',
          description: 'This employee already has system access',
        })
        router.push(`/employees/profiles/${employeeId}`)
      }
    } catch (error) {
      // Ignore error, just means we need to activate
    }
  }

  const onSubmit = async (data: SystemAccessFormData) => {
    try {
      // If useEmailAsUsername is checked, use employee's email as username
      const finalData = {
        ...data,
        systemUsername: data.useEmailAsUsername && currentEmployee?.email 
          ? currentEmployee.email 
          : data.systemUsername,
      }

      const employee = await activateSystemAccess(employeeId, finalData)
      
      toast({
        title: 'Success',
        description: `System access activated for ${employee.firstName} ${employee.lastName}`,
      })
      
      // Navigate to phase 3 - profile verification
      router.push(`/employees/profiles/${employeeId}?showVerification=true`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate system access',
        variant: 'error',
      })
    }
  }

  const useEmailAsUsername = watch('useEmailAsUsername')

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading employee data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Activate System Access</h1>
          <p className="text-gray-600">
            Phase 2: Activate system access for {currentEmployee.fullName}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">Phase 2 of 3: System Access Activation</h3>
            <p className="text-blue-700 text-sm mt-1">
              Employee registration (Phase 1) is complete. Now activate system access.
              After this, the employee will need to verify their profile (Phase 3).
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            Review employee details before activating system access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Full Name</Label>
              <p className="font-medium">{currentEmployee.fullName}</p>
            </div>
            <div>
              <Label className="text-gray-500">Employee Number</Label>
              <p className="font-medium">{currentEmployee.employeeNumber}</p>
            </div>
            <div>
              <Label className="text-gray-500">Email</Label>
              <p className="font-medium">{currentEmployee.email}</p>
            </div>
            <div>
              <Label className="text-gray-500">Department</Label>
              <p className="font-medium">{currentEmployee.departmentId.departmentName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>System Access Configuration</CardTitle>
            <CardDescription>
              Configure username and role for system access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Use Email as Username</Label>
                  <p className="text-sm text-gray-500">
                    Automatically use employee's email as username
                  </p>
                </div>
                <Switch
                  checked={useEmailAsUsername}
                  onCheckedChange={(checked) => {
                    setValue('useEmailAsUsername', checked)
                    if (checked) {
                      setValue('systemUsername', currentEmployee?.email || '')
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemUsername">Username *</Label>
                <Input
                  id="systemUsername"
                  placeholder="john.doe"
                  {...register('systemUsername')}
                  disabled={useEmailAsUsername}
                  value={
                    useEmailAsUsername 
                      ? currentEmployee?.email || ''
                      : watch('systemUsername') || ''
                  }
                  className={errors.systemUsername ? 'border-red-500' : ''}
                />
                {errors.systemUsername && (
                  <p className="text-sm text-red-500">{errors.systemUsername.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemRole">System Role *</Label>
                <Input
                  id="systemRole"
                  placeholder="employee"
                  {...register('systemRole')}
                  className={errors.systemRole ? 'border-red-500' : ''}
                />
                {errors.systemRole && (
                  <p className="text-sm text-red-500">{errors.systemRole.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  Suggested roles: employee, supervisor, manager, hr_admin, finance_manager
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/employees/profiles/${employeeId}`)}
          >
            Skip for Now
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Activating...' : 'Activate System Access'}
          </Button>
        </div>
      </form>
    </div>
  )
}