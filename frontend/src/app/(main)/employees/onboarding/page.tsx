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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEmployeeStore } from '@/store/slices/employee-slice'
import { ArrowLeft } from 'lucide-react'

// Updated validation schema to match backend
const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  nationalId: z.string().min(5, 'National ID is required'),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(10, 'Phone number is required'),
  personalEmail: z.string().email('Valid personal email is required').optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  positionId: z.string().min(1, 'Position is required'),
  gradeId: z.string().min(1, 'Grade is required'),
  reportsToEmployeeId: z.string().optional(),
  employmentDate: z.string().min(1, 'Employment date is required'),
  contractType: z.enum(['PROBATION', 'CONTRACT', 'PERMANENT']),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankBranch: z.string().optional(),
  bankBranchCode: z.string().optional(),
  bankSwiftCode: z.string().optional(),
  currency: z.string().optional(),
  taxIdentificationNumber: z.string().optional(),
  pensionNumber: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
  currentBasicSalary: z.number().min(0, 'Salary must be positive'),
  maritalStatus: z.string().optional(),
  numberOfDependents: z.number().min(0).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  createSystemAccess: z.boolean().default(false),
  systemUsername: z.string().optional(),
  isSupervisor: z.boolean().default(false),
  isDepartmentManager: z.boolean().default(false),
  systemRole: z.string().optional(),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

export default function EmployeeOnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { 
    departments, 
    positions, 
    grades, 
    isLoading, 
    fetchDepartments, 
    fetchPositions, 
    fetchGrades,
    registerEmployee 
  } = useEmployeeStore()
  
  const [activeTab, setActiveTab] = useState('personal')
  const [createSystemAccess, setCreateSystemAccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      gender: 'male',
      contractType: 'PROBATION',
      createSystemAccess: false,
      isSupervisor: false,
      isDepartmentManager: false,
      currency: 'TZS',
      country: 'Tanzania',
    },
  })

  const departmentId = watch('departmentId')
  const gradeId = watch('gradeId')

  useEffect(() => {
    loadDependencies()
  }, [])

  useEffect(() => {
    if (departmentId) {
      loadPositionsForDepartment(departmentId)
    }
  }, [departmentId])

  const loadDependencies = async () => {
    try {
      await Promise.all([
        fetchDepartments(),
        fetchGrades(),
      ])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const loadPositionsForDepartment = async (deptId: string) => {
    try {
      await fetchPositions({ 
        departmentId: deptId,
        hasVacancies: true
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load positions for this department',
        variant: 'error',
      })
    }
  }

  const validateTab = async (currentTab: string): Promise<boolean> => {
    let fieldsToValidate: (keyof EmployeeFormData)[] = []

    switch (currentTab) {
      case 'personal':
        fieldsToValidate = ['firstName', 'lastName', 'dateOfBirth', 'gender', 
                           'nationalId', 'email', 'phoneNumber']
        break
      case 'employment':
        fieldsToValidate = ['departmentId', 'positionId', 'gradeId', 
                           'employmentDate', 'contractType', 'currentBasicSalary']
        break
    }

    const result = await trigger(fieldsToValidate)
    return result
  }

  const handleTabChange = async (newTab: string) => {
    if (newTab === activeTab) return

    // Validate current tab before allowing navigation
    const isValid = await validateTab(activeTab)
    if (isValid) {
      setActiveTab(newTab)
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
        variant: 'error',
      })
    }
  }

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      console.log('Submitting employee data:', data)
      
      const employee = await registerEmployee(data)
      
      toast({
        title: 'Success',
        description: `Employee ${employee.firstName} ${employee.lastName} has been registered successfully`,
      })
      
      // Based on 3-phase process:
      // 1. Registration complete (Phase 1)
      // 2. System access activation (Phase 2 - if createSystemAccess is true)
      // 3. Profile verification (Phase 3 - employee does this themselves)
      
      if (data.createSystemAccess && data.systemUsername) {
        // Navigate to system access activation page
        router.push(`/employees/${employee._id}/activate-system-access`)
      } else {
        // Just go to employee profile
        router.push(`/employees/profiles/${employee._id}`)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to register employee',
        variant: 'error',
      })
    }
  }

  // Filter positions to show only those with vacancies
  const availablePositions = positions.filter(pos => 
    pos.availablePositions > 0 && 
    (!departmentId || pos.departmentId === departmentId)
  )

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold text-requesta-primary">Employee Onboarding</h1>
          <p className="text-gray-600">Register a new employee in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="employment">Employment Details</TabsTrigger>
            <TabsTrigger value="system">System Access</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic personal details of the employee</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      placeholder="Michael"
                      {...register('middleName')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                      className={errors.dateOfBirth ? 'border-red-500' : ''}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      onValueChange={(value) => setValue('gender', value as any)}
                      defaultValue="male"
                    >
                      <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID *</Label>
                    <Input
                      id="nationalId"
                      placeholder="1234567890123"
                      {...register('nationalId')}
                      className={errors.nationalId ? 'border-red-500' : ''}
                    />
                    {errors.nationalId && (
                      <p className="text-sm text-red-500">{errors.nationalId.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+255 123 456 789"
                      {...register('phoneNumber')}
                      className={errors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="personalEmail">Personal Email</Label>
                    <Input
                      id="personalEmail"
                      type="email"
                      placeholder="john.doe.personal@gmail.com"
                      {...register('personalEmail')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      placeholder="Jane Doe"
                      {...register('emergencyContactName')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      placeholder="+255 987 654 321"
                      {...register('emergencyContactPhone')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={() => handleTabChange('employment')}
              >
                Next: Employment Details
              </Button>
            </div>
          </TabsContent>

          {/* Employment Details Tab */}
          <TabsContent value="employment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
                <CardDescription>Job-related information and compensation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department *</Label>
                    <Select 
                      onValueChange={(value) => {
                        setValue('departmentId', value)
                        setValue('positionId', '')
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={errors.departmentId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept._id}>
                            {dept.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.departmentId && (
                      <p className="text-sm text-red-500">{errors.departmentId.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="positionId">Position *</Label>
                    <Select 
                      onValueChange={(value) => setValue('positionId', value)}
                      disabled={!departmentId || isLoading || availablePositions.length === 0}
                      value={watch('positionId')}
                    >
                      <SelectTrigger className={errors.positionId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={
                          !departmentId 
                            ? "Select department first"
                            : availablePositions.length === 0
                            ? "No available positions"
                            : "Select position"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePositions.map((pos) => (
                          <SelectItem key={pos._id} value={pos._id}>
                            {pos.positionTitle} ({pos.availablePositions} available)
                          </SelectItem>
                        ))}
                        
                        {availablePositions.length === 0 && departmentId && (
                          <div className="px-2 py-3 text-sm text-gray-500 text-center">
                            No available positions in this department
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.positionId && (
                      <p className="text-sm text-red-500">{errors.positionId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gradeId">Grade *</Label>
                    <Select 
                      onValueChange={(value) => setValue('gradeId', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={errors.gradeId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade._id} value={grade._id}>
                            {grade.name} ({grade.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gradeId && (
                      <p className="text-sm text-red-500">{errors.gradeId.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employmentDate">Employment Date *</Label>
                    <Input
                      id="employmentDate"
                      type="date"
                      {...register('employmentDate')}
                      className={errors.employmentDate ? 'border-red-500' : ''}
                    />
                    {errors.employmentDate && (
                      <p className="text-sm text-red-500">{errors.employmentDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type *</Label>
                    <Select 
                      onValueChange={(value) => setValue('contractType', value as any)}
                      defaultValue="PROBATION"
                    >
                      <SelectTrigger className={errors.contractType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROBATION">Probation</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="PERMANENT">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.contractType && (
                      <p className="text-sm text-red-500">{errors.contractType.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentBasicSalary">Basic Salary (TZS) *</Label>
                    <Input
                      id="currentBasicSalary"
                      type="number"
                      placeholder="750000"
                      {...register('currentBasicSalary', { valueAsNumber: true })}
                      className={errors.currentBasicSalary ? 'border-red-500' : ''}
                    />
                    {errors.currentBasicSalary && (
                      <p className="text-sm text-red-500">{errors.currentBasicSalary.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bank Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="CRDB Bank"
                        {...register('bankName')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNumber">Account Number</Label>
                      <Input
                        id="bankAccountNumber"
                        placeholder="0151234567890"
                        {...register('bankAccountNumber')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankBranch">Branch</Label>
                      <Input
                        id="bankBranch"
                        placeholder="Dar es Salaam City Center"
                        {...register('bankBranch')}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankBranchCode">Branch Code</Label>
                      <Input
                        id="bankBranchCode"
                        placeholder="1300"
                        {...register('bankBranchCode')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankSwiftCode">SWIFT Code</Label>
                      <Input
                        id="bankSwiftCode"
                        placeholder="CORUTZTZ"
                        {...register('bankSwiftCode')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        placeholder="TZS"
                        {...register('currency')}
                        defaultValue="TZS"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxIdentificationNumber">Tax PIN</Label>
                    <Input
                      id="taxIdentificationNumber"
                      placeholder="TPIN123456789"
                      {...register('taxIdentificationNumber')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pensionNumber">Pension Number</Label>
                    <Input
                      id="pensionNumber"
                      placeholder="PEN123456"
                      {...register('pensionNumber')}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street, Kinondoni"
                        {...register('address')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Dar es Salaam"
                        {...register('city')}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="Tanzania"
                        {...register('country')}
                        defaultValue="Tanzania"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="14112"
                        {...register('postalCode')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab('personal')}
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={() => handleTabChange('system')}
              >
                Next: System Access
              </Button>
            </div>
          </TabsContent>

          {/* System Access Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Access Configuration</CardTitle>
                <CardDescription>Configure system access and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Create System Access</Label>
                    <p className="text-sm text-gray-500">
                      Create user account for this employee
                    </p>
                  </div>
                  <Switch
                    checked={createSystemAccess}
                    onCheckedChange={(checked) => {
                      setCreateSystemAccess(checked)
                      setValue('createSystemAccess', checked)
                      if (!checked) {
                        setValue('systemUsername', '')
                        setValue('systemRole', '')
                      }
                    }}
                  />
                </div>

                {createSystemAccess && (
                  <div className="space-y-6 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="systemUsername">Username *</Label>
                        <Input
                          id="systemUsername"
                          placeholder="john.doe"
                          {...register('systemUsername')}
                          required={createSystemAccess}
                        />
                        {errors.systemUsername && (
                          <p className="text-sm text-red-500">{errors.systemUsername.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="systemRole">System Role</Label>
                        <Select 
                          onValueChange={(value) => setValue('systemRole', value)}
                          required={createSystemAccess}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="hr_admin">HR Admin</SelectItem>
                            <SelectItem value="finance_manager">Finance Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Supervisor Role</Label>
                        <p className="text-sm text-gray-500">
                          This employee will have supervisor permissions
                        </p>
                      </div>
                      <Switch
                        onCheckedChange={(checked) => setValue('isSupervisor', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Department Manager</Label>
                        <p className="text-sm text-gray-500">
                          This employee will manage the entire department
                        </p>
                      </div>
                      <Switch
                        onCheckedChange={(checked) => setValue('isDepartmentManager', checked)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab('employment')}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="bg-requesta-primary hover:bg-requesta-primary-light"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}