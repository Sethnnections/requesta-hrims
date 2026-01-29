'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployeeStore } from '@/store/slices/employee-slice'
import { getInitials, formatDate, formatCurrency } from '@/lib/utils'
import { 
  ArrowLeft, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building, 
  Banknote,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const employeeId = params.id as string
  
  const {
    currentEmployee,
    isLoading,
    fetchEmployeeById,
    activateSystemAccess,
    verifyProfile,
    getRegistrationStatus,
    approveRegistration,
    checkSupervisorStatus,
  } = useEmployeeStore()
  
  const [registrationStatus, setRegistrationStatus] = useState<{
    hasSystemAccess: boolean
    profileVerified: boolean
    registrationComplete: boolean
  } | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (employeeId) {
      loadEmployeeData()
    }
  }, [employeeId])

  const loadEmployeeData = async () => {
    try {
      await fetchEmployeeById(employeeId)
      const status = await getRegistrationStatus(employeeId)
      setRegistrationStatus(status)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const handleActivateSystemAccess = async () => {
    if (!currentEmployee) return
    
    try {
      await activateSystemAccess(employeeId, {
        systemUsername: currentEmployee.email.split('@')[0],
        systemRole: 'employee',
        useEmailAsUsername: false,
      })
      
      toast({
        title: 'Success',
        description: 'System access has been activated',
      })
      
      loadEmployeeData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const handleVerifyProfile = async () => {
    try {
      await verifyProfile(employeeId)
      
      toast({
        title: 'Success',
        description: 'Profile has been verified',
      })
      
      loadEmployeeData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const handleApproveRegistration = async () => {
    try {
      await approveRegistration(employeeId)
      
      toast({
        title: 'Success',
        description: 'Registration has been approved',
      })
      
      loadEmployeeData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const handleCheckSupervisorStatus = async () => {
    try {
      await checkSupervisorStatus(employeeId)
      
      toast({
        title: 'Supervisor Status Updated',
        description: 'Supervisor status has been checked and updated.',
      })
      
      loadEmployeeData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!currentEmployee) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">Employee not found</div>
        <Button onClick={() => router.push('/employees/directory')}>
          Back to Directory
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/employees/directory')}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-requesta-primary">
              {currentEmployee.firstName} {currentEmployee.lastName}
            </h1>
            <p className="text-gray-600">{currentEmployee.employeeNumber}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!currentEmployee.hasSystemAccess && (
            <Button 
              onClick={handleActivateSystemAccess}
              className="bg-requesta-primary hover:bg-requesta-primary-light"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Activate System Access
            </Button>
          )}
          
          {!currentEmployee.profileVerified && (
            <Button 
              variant="outline"
              onClick={handleVerifyProfile}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify Profile
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                {currentEmployee.hasSystemAccess ? (
                  <UserCheck className="h-6 w-6 text-green-600" />
                ) : (
                  <UserX className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">System Access</div>
                <div className="font-semibold">
                  {currentEmployee.hasSystemAccess ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Profile Status</div>
                <div className="font-semibold">
                  {currentEmployee.profileVerified ? 'Verified' : 'Pending'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Position</div>
                <div className="font-semibold">
                  {currentEmployee.positionId?.positionTitle || 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-orange-100 rounded-full">
                <Banknote className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Salary</div>
                <div className="font-semibold">
                  {formatCurrency(currentEmployee.currentBasicSalary, 'MWK')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="system">System Access</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(`${currentEmployee.firstName} ${currentEmployee.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>Personal Information</div>
                    <CardDescription>Basic personal details</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Full Name</div>
                  <div className="font-medium">
                    {currentEmployee.firstName} {currentEmployee.middleName} {currentEmployee.lastName}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Date of Birth</div>
                    <div className="font-medium">
                      {formatDate(currentEmployee.dateOfBirth, 'display')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Gender</div>
                    <div className="font-medium capitalize">
                      {currentEmployee.gender}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">National ID</div>
                  <div className="font-medium font-mono">
                    {currentEmployee.nationalId}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{currentEmployee.email}</span>
                    </div>
                    {currentEmployee.personalEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{currentEmployee.personalEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{currentEmployee.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <div>
                    <div>Employment Details</div>
                    <CardDescription>Job and organizational information</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Employee Number</div>
                      <div className="font-medium font-mono">
                        {currentEmployee.employeeNumber}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Department</div>
                      <div className="font-medium">
                        {currentEmployee.departmentId?.departmentName}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Position</div>
                      <div className="font-medium">
                        {currentEmployee.positionId?.positionTitle}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Grade</div>
                      <div className="font-medium">
                        {currentEmployee.gradeId?.name} ({currentEmployee.gradeId?.code})
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Employment Date</div>
                      <div className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(currentEmployee.employmentDate, 'display')}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Contract Type</div>
                      <div className="font-medium">
                        {currentEmployee.contractType}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Employment Status</div>
                      <div>{getStatusBadge(currentEmployee.employmentStatus)}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Reports To</div>
                      <div className="font-medium">
                        {currentEmployee.reportsToEmployeeId?.fullName || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compensation & Bank Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Basic Salary</div>
                  <div className="text-2xl font-bold text-requesta-primary">
                    {formatCurrency(currentEmployee.currentBasicSalary, 'MWK')}
                  </div>
                </div>
                
                {currentEmployee.gradeId?.compensation && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Grade Compensation Package</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>House Allowance:</span>
                        <span>{formatCurrency(currentEmployee.gradeId.compensation.houseAllowance, 'MWK')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Car Allowance:</span>
                        <span>{formatCurrency(currentEmployee.gradeId.compensation.carAllowance, 'MWK')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Travel Allowance:</span>
                        <span>{formatCurrency(currentEmployee.gradeId.compensation.travelAllowance, 'MWK')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime Rate:</span>
                        <span>{currentEmployee.gradeId.compensation.overtimeRate}x</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bank & Tax Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentEmployee.bankName && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Bank Details</div>
                    <div className="space-y-1">
                      <div className="font-medium">{currentEmployee.bankName}</div>
                      {currentEmployee.bankAccountNumber && (
                        <div className="font-mono">{currentEmployee.bankAccountNumber}</div>
                      )}
                      {currentEmployee.bankBranch && (
                        <div className="text-sm">{currentEmployee.bankBranch}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {(currentEmployee.taxIdentificationNumber || currentEmployee.pensionNumber) && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Government IDs</div>
                    <div className="space-y-1">
                      {currentEmployee.taxIdentificationNumber && (
                        <div className="flex justify-between">
                          <span>Tax PIN:</span>
                          <span className="font-mono">{currentEmployee.taxIdentificationNumber}</span>
                        </div>
                      )}
                      {currentEmployee.pensionNumber && (
                        <div className="flex justify-between">
                          <span>Pension No:</span>
                          <span className="font-mono">{currentEmployee.pensionNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Access Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Access Management</CardTitle>
              <CardDescription>Manage user account and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">System Account Status</div>
                    <div className="text-sm text-gray-500">
                      {currentEmployee.hasSystemAccess 
                        ? 'User can access the system with assigned permissions'
                        : 'No system account created yet'
                      }
                    </div>
                  </div>
                  <Badge variant={currentEmployee.hasSystemAccess ? "default" : "secondary"}>
                    {currentEmployee.hasSystemAccess ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {currentEmployee.hasSystemAccess && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Username</div>
                        <div className="font-medium">
                          {currentEmployee.systemUsername || currentEmployee.email.split('@')[0]}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">System Role</div>
                        <div className="font-medium capitalize">
                          {currentEmployee.systemRole?.replace('_', ' ') || 'employee'}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Supervisor Status</div>
                        <div className="font-medium">
                          {currentEmployee.isSupervisor ? 'Yes' : 'No'}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Department Manager</div>
                        <div className="font-medium">
                          {currentEmployee.isDepartmentManager ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleCheckSupervisorStatus}
                      className="w-full"
                    >
                      Re-check Supervisor Status
                    </Button>
                  </div>
                )}

                {registrationStatus && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="text-sm font-medium">Registration Status</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        registrationStatus.hasSystemAccess ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        {registrationStatus.hasSystemAccess ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="font-medium">System Access</div>
                          <div className="text-sm text-gray-500">
                            {registrationStatus.hasSystemAccess ? 'Active' : 'Pending'}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        registrationStatus.profileVerified ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        {registrationStatus.profileVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="font-medium">Profile Verification</div>
                          <div className="text-sm text-gray-500">
                            {registrationStatus.profileVerified ? 'Verified' : 'Pending'}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        registrationStatus.registrationComplete ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        {registrationStatus.registrationComplete ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="font-medium">Registration Complete</div>
                          <div className="text-sm text-gray-500">
                            {registrationStatus.registrationComplete ? 'Complete' : 'In Progress'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!currentEmployee.hasSystemAccess && (
                    <Button 
                      onClick={handleActivateSystemAccess}
                      className="bg-requesta-primary hover:bg-requesta-primary-light"
                    >
                      Activate System Access
                    </Button>
                  )}
                  
                  {!currentEmployee.profileVerified && (
                    <Button 
                      variant="outline"
                      onClick={handleVerifyProfile}
                    >
                      Verify Profile
                    </Button>
                  )}
                  
                  {registrationStatus && !registrationStatus.registrationComplete && (
                    <Button 
                      variant="secondary"
                      onClick={handleApproveRegistration}
                    >
                      Approve Registration
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}