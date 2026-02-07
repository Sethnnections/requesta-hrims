'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useEmployeeStore } from '@/store/slices/employee-slice'
import { useAuth } from '@/hooks/auth/use-auth'
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
  XCircle,
  Edit,
  Send,
  Clock,
  FileText,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  MoreVertical
} from 'lucide-react'

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { hasPermission } = useAuth()
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
    updateEmployee,
  } = useEmployeeStore()
  
  const [registrationStatus, setRegistrationStatus] = useState<{
    hasSystemAccess: boolean
    profileVerified: boolean
    registrationComplete: boolean
    registrationStatus: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [showActivationDialog, setShowActivationDialog] = useState(false)
  const [activationData, setActivationData] = useState({
    systemUsername: '',
    systemRole: 'employee',
    useEmailAsUsername: false,
  })
  const [isActivating, setIsActivating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editData, setEditData] = useState<any>({})

  useEffect(() => {
    if (employeeId) {
      loadEmployeeData()
    }
  }, [employeeId])

  useEffect(() => {
    const showVerification = searchParams.get('showVerification')
    if (showVerification === 'true') {
      setShowVerificationDialog(true)
    }
  }, [searchParams])

 // Also, update the loadEmployeeData function to handle the response correctly
const loadEmployeeData = async () => {
  try {
    await fetchEmployeeById(employeeId)
    const status = await getRegistrationStatus(employeeId)
    setRegistrationStatus({
      ...status,
      registrationStatus: status.registrationStatus || 'PENDING'
    })
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to load employee data',
      variant: 'error',
    })
  }
}

  const handleActivateSystemAccess = async () => {
    if (!currentEmployee) return
    
    setIsActivating(true)
    try {
      const finalUsername = activationData.useEmailAsUsername 
        ? currentEmployee.email.split('@')[0]
        : activationData.systemUsername

      await activateSystemAccess(employeeId, {
        systemUsername: finalUsername,
        systemRole: activationData.systemRole,
        useEmailAsUsername: activationData.useEmailAsUsername,
      })
      
      toast({
        title: 'Success',
        description: 'System access has been activated successfully',
      })
      
      setShowActivationDialog(false)
      loadEmployeeData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate system access',
        variant: 'error',
      })
    } finally {
      setIsActivating(false)
    }
  }

  const handleVerifyProfile = async () => {
    setIsVerifying(true)
    try {
      await verifyProfile(employeeId)
      
      toast({
        title: 'Success',
        description: 'Profile has been verified successfully',
      })
      
      setShowVerificationDialog(false)
      loadEmployeeData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify profile',
        variant: 'error',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleApproveRegistration = async () => {
    try {
      await approveRegistration(employeeId)
      
      toast({
        title: 'Success',
        description: 'Registration has been approved successfully',
      })
      
      loadEmployeeData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve registration',
        variant: 'error',
      })
    }
  }

  const handleCheckSupervisorStatus = async () => {
    try {
      await checkSupervisorStatus(employeeId)
      
      toast({
        title: 'Success',
        description: 'Supervisor status has been checked and updated',
      })
      
      loadEmployeeData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check supervisor status',
        variant: 'error',
      })
    }
  }

 // Update the handleUpdateEmployee function in your profile page
const handleUpdateEmployee = async () => {
  try {
    // Remove fields that shouldn't be updated directly
    const { _id, createdAt, updatedAt, employeeNumber, ...safeUpdates } = editData
    
    const employee = await updateEmployee(employeeId, safeUpdates)
    
    toast({
      title: 'Success',
      description: 'Employee information updated successfully',
    })
    
    setShowEditDialog(false)
    loadEmployeeData()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to update employee',
      variant: 'error',
    })
  }
}



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inactive</Badge>
      case 'SUSPENDED':
        return <Badge variant="destructive">Suspended</Badge>
      case 'TERMINATED':
        return <Badge variant="outline" className="border-gray-300">Terminated</Badge>
      case 'ON_LEAVE':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">On Leave</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRegistrationStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-700">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'COMPLETED':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return null
    }
  }

  const getContractTypeBadge = (type: string) => {
    switch (type) {
      case 'PERMANENT':
        return <Badge variant="outline" className="border-green-300 text-green-700">Permanent</Badge>
      case 'CONTRACT':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Contract</Badge>
      case 'PROBATION':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-700">Probation</Badge>
      case 'TEMPORARY':
        return <Badge variant="outline" className="border-gray-300 text-gray-700">Temporary</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (isLoading && !currentEmployee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-12 w-64" />
        </div>
        <Skeleton className="h-32 w-full" />
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

  const canEdit = hasPermission('EMPLOYEES_MANAGE_ALL') || 
                 hasPermission('EMPLOYEES_MANAGE_DEPARTMENT')

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
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {currentEmployee.profilePhoto ? (
                <AvatarImage src={currentEmployee.profilePhoto} alt={currentEmployee.fullName} />
              ) : null}
              <AvatarFallback className="text-lg">
                {getInitials(`${currentEmployee.firstName} ${currentEmployee.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-requesta-primary">
                {currentEmployee.firstName} {currentEmployee.middleName} {currentEmployee.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600 font-mono">{currentEmployee.employeeNumber}</p>
                {getStatusBadge(currentEmployee.employmentStatus)}
                {getRegistrationStatusBadge(currentEmployee.registrationStatus)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button 
              variant="outline"
              onClick={() => {
                setEditData(currentEmployee)
                setShowEditDialog(true)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
          
          {!currentEmployee.hasSystemAccess && hasPermission('EMPLOYEES_MANAGE_ALL') && (
            <Button 
              onClick={() => setShowActivationDialog(true)}
              className="bg-requesta-primary hover:bg-requesta-primary-light"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Activate System
            </Button>
          )}
          
          {!currentEmployee.profileVerified && hasPermission('EMPLOYEES_MANAGE_ALL') && (
            <Button 
              variant="outline"
              onClick={() => setShowVerificationDialog(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify Profile
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Building className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Department</div>
                <div className="font-semibold">
                  {currentEmployee.departmentId?.departmentName || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="system">System Access</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <UserCheck className="h-5 w-5 text-gray-600" />
                    </div>
                    <span>Personal Information</span>
                  </div>
                  {canEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditData({
                          ...currentEmployee,
                          dateOfBirth: currentEmployee.dateOfBirth.split('T')[0],
                        })
                        setShowEditDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>Basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Full Name</Label>
                  <div className="font-medium">
                    {currentEmployee.firstName} {currentEmployee.middleName} {currentEmployee.lastName}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Date of Birth</Label>
                    <div className="font-medium">
                      {formatDate(currentEmployee.dateOfBirth, 'display')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Gender</Label>
                    <div className="font-medium capitalize">
                      {currentEmployee.gender}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">National ID</Label>
                  <div className="font-medium font-mono">
                    {currentEmployee.nationalId}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Contact Information</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Company Email</div>
                        <div className="font-medium">{currentEmployee.email}</div>
                      </div>
                    </div>
                    
                    {currentEmployee.personalEmail && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Mail className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Personal Email</div>
                          <div className="font-medium">{currentEmployee.personalEmail}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone Number</div>
                        <div className="font-medium">{currentEmployee.phoneNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {(currentEmployee.emergencyContactName || currentEmployee.emergencyContactPhone) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">Emergency Contact</Label>
                      <div className="space-y-2">
                        {currentEmployee.emergencyContactName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{currentEmployee.emergencyContactName}</span>
                          </div>
                        )}
                        {currentEmployee.emergencyContactPhone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{currentEmployee.emergencyContactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Address & Bank Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Building className="h-5 w-5 text-gray-600" />
                    </div>
                    <span>Address & Bank Details</span>
                  </div>
                  {canEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditData({
                          ...currentEmployee,
                          address: currentEmployee.address || '',
                          city: currentEmployee.city || '',
                          country: currentEmployee.country || '',
                          postalCode: currentEmployee.postalCode || '',
                          bankName: currentEmployee.bankName || '',
                          bankAccountNumber: currentEmployee.bankAccountNumber || '',
                          bankBranch: currentEmployee.bankBranch || '',
                          bankBranchCode: currentEmployee.bankBranchCode || '',
                          bankSwiftCode: currentEmployee.bankSwiftCode || '',
                          taxIdentificationNumber: currentEmployee.taxIdentificationNumber || '',
                          pensionNumber: currentEmployee.pensionNumber || '',
                        })
                        setShowEditDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>Address and banking information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(currentEmployee.address || currentEmployee.city || currentEmployee.country) && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Address Information</div>
                    <div className="space-y-2">
                      {currentEmployee.address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-right">{currentEmployee.address}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {currentEmployee.city && (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">City</div>
                            <div className="font-medium">{currentEmployee.city}</div>
                          </div>
                        )}
                        {currentEmployee.country && (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Country</div>
                            <div className="font-medium">{currentEmployee.country}</div>
                          </div>
                        )}
                      </div>
                      {currentEmployee.postalCode && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Postal Code</div>
                          <div className="font-medium">{currentEmployee.postalCode}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(currentEmployee.bankName || currentEmployee.taxIdentificationNumber) && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Bank & Tax Information</div>
                    <div className="space-y-3">
                      {currentEmployee.bankName && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Bank Name</div>
                          <div className="font-medium">{currentEmployee.bankName}</div>
                        </div>
                      )}
                      
                      {currentEmployee.bankAccountNumber && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Account Number</div>
                          <div className="font-medium font-mono">{currentEmployee.bankAccountNumber}</div>
                        </div>
                      )}
                      
                      {(currentEmployee.bankBranch || currentEmployee.bankBranchCode) && (
                        <div className="grid grid-cols-2 gap-4">
                          {currentEmployee.bankBranch && (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">Branch</div>
                              <div className="font-medium">{currentEmployee.bankBranch}</div>
                            </div>
                          )}
                          {currentEmployee.bankBranchCode && (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">Branch Code</div>
                              <div className="font-medium">{currentEmployee.bankBranchCode}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {currentEmployee.taxIdentificationNumber && (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Tax PIN</div>
                            <div className="font-medium font-mono">{currentEmployee.taxIdentificationNumber}</div>
                          </div>
                        )}
                        {currentEmployee.pensionNumber && (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500">Pension No</div>
                            <div className="font-medium font-mono">{currentEmployee.pensionNumber}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment Summary */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                  </div>
                  <span>Employment Summary</span>
                </CardTitle>
                <CardDescription>Key employment details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Employee Number</div>
                    <div className="font-medium font-mono text-lg">
                      {currentEmployee.employeeNumber}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                        {getContractTypeBadge(currentEmployee.contractType)}
                      </div>
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
                      <div className="text-sm text-gray-500 mt-1">
                        Code: {currentEmployee.positionId?.positionCode}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Reports To</div>
                    <div className="font-medium">
                      {currentEmployee.reportsToEmployeeId ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          onClick={() => router.push(`/employees/profiles/${currentEmployee.reportsToEmployeeId?._id}`)}
                        >
                          {currentEmployee.reportsToEmployeeId.fullName}
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compensation Tab */}
        <TabsContent value="compensation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Banknote className="h-5 w-5 text-green-600" />
                  </div>
                  <span>Current Compensation</span>
                </CardTitle>
                <CardDescription>Salary and allowances breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Basic Salary</div>
                  <div className="text-3xl font-bold text-requesta-primary">
                    {formatCurrency(currentEmployee.currentBasicSalary, 'MWK')}
                  </div>
                  <div className="text-sm text-gray-500">Per month</div>
                </div>

                {currentEmployee.gradeId?.compensation && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Grade Allowances</div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">House Allowance</span>
                        <span className="font-medium">
                          {formatCurrency(currentEmployee.gradeId.compensation.houseAllowance, 'MWK')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Car Allowance</span>
                        <span className="font-medium">
                          {formatCurrency(currentEmployee.gradeId.compensation.carAllowance, 'MWK')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Travel Allowance</span>
                        <span className="font-medium">
                          {formatCurrency(currentEmployee.gradeId.compensation.travelAllowance, 'MWK')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Overtime Rate</span>
                        <span className="font-medium">
                          {currentEmployee.gradeId.compensation.overtimeRate}x normal rate
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-sm font-medium">Grade Salary Range</div>
                  {currentEmployee.gradeId?.compensation?.basicSalary && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Minimum</span>
                        <span className="font-medium">
                          {formatCurrency(currentEmployee.gradeId.compensation.basicSalary.min, 'MWK')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Midpoint</span>
                        <span className="font-medium">
                          {formatCurrency(currentEmployee.gradeId.compensation.basicSalary.mid, 'MWK')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Maximum</span>
                        <span className="font-medium">
                          {formatCurrency(currentEmployee.gradeId.compensation.basicSalary.max, 'MWK')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Grade Information</span>
                </CardTitle>
                <CardDescription>Grade details and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentEmployee.gradeId && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Grade Name</div>
                        <div className="font-medium">{currentEmployee.gradeId.name}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Grade Code</div>
                        <div className="font-medium font-mono">{currentEmployee.gradeId.code}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Grade Level</div>
                        <div className="font-medium">{currentEmployee.gradeId.level}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Grade Band</div>
                        <div className="font-medium">{ 'N/A'}</div>
                      </div>
                    </div>
                    
                    {currentEmployee.gradeId.limits && (
                      <div className="space-y-4">
                        <div className="text-sm font-medium">Approval Limits</div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Max Loan Amount</span>
                            <span className="font-medium">
                              {formatCurrency(currentEmployee.gradeId.limits.maxLoanAmount, 'MWK')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Requires Manager Approval</span>
                            <Badge variant={currentEmployee.gradeId.limits.requiresManagerApproval ? "default" : "outline"}>
                              {currentEmployee.gradeId.limits.requiresManagerApproval ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Requires Director Approval</span>
                            <Badge variant={currentEmployee.gradeId.limits.requiresDirectorApproval ? "default" : "outline"}>
                              {currentEmployee.gradeId.limits.requiresDirectorApproval ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Max Approval Level</span>
                            <span className="font-medium">
                              {currentEmployee.gradeId.limits.maxApprovalLevel || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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
                <div className={`flex items-center justify-between p-4 border rounded-lg ${
                  currentEmployee.hasSystemAccess ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}>
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

                {currentEmployee.hasSystemAccess ? (
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
                          {currentEmployee.systemRole?.replace(/_/g, ' ') || 'employee'}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Supervisor Status</div>
                        <div className="font-medium">
                          {currentEmployee.isSupervisor ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">Yes</Badge>
                          ) : (
                            'No'
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Department Manager</div>
                        <div className="font-medium">
                          {currentEmployee.isDepartmentManager ? (
                            <Badge variant="default" className="bg-purple-100 text-purple-800">Yes</Badge>
                          ) : (
                            'No'
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCheckSupervisorStatus}
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-check Supervisor Status
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setShowActivationDialog(true)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update System Access
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800">System Access Not Activated</div>
                        <p className="text-sm text-yellow-700 mt-1">
                          This employee cannot access the system yet. Activate system access to create their user account.
                        </p>
                        <Button 
                          onClick={() => setShowActivationDialog(true)}
                          className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate System Access
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {registrationStatus && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="text-sm font-medium">Registration Progress</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        registrationStatus.hasSystemAccess ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}>
                        {registrationStatus.hasSystemAccess ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="font-medium">Phase 1: System Access</div>
                          <div className="text-sm text-gray-500">
                            {registrationStatus.hasSystemAccess ? 'Activated' : 'Pending'}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        registrationStatus.profileVerified ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}>
                        {registrationStatus.profileVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="font-medium">Phase 2: Profile Verification</div>
                          <div className="text-sm text-gray-500">
                            {registrationStatus.profileVerified ? 'Verified' : 'Pending'}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        registrationStatus.registrationComplete ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}>
                        {registrationStatus.registrationComplete ? (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <div className="font-medium">Phase 3: Registration</div>
                          <div className="text-sm text-gray-500">
                            {registrationStatus.registrationComplete ? 'Complete' : 'In Progress'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <div className="text-sm text-gray-500 mb-2">Current Status</div>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {registrationStatus.registrationStatus?.replace(/_/g, ' ') || 'Pending'}
                        </div>
                        {hasPermission('EMPLOYEES_MANAGE_ALL') && !registrationStatus.registrationComplete && (
                          <Button 
                            variant="outline"
                            onClick={handleApproveRegistration}
                          >
                            Approve Registration
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Verify Employee Profile
            </DialogTitle>
            <DialogDescription>
              This will mark the employee's profile as verified. The employee will receive a notification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">Verification Required</div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Confirm that all employee information is accurate before verification.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Employee Details</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{currentEmployee.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employee Number:</span>
                  <span className="font-medium">{currentEmployee.employeeNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{currentEmployee.departmentId?.departmentName}</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyProfile}
              disabled={isVerifying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isVerifying ? 'Verifying...' : 'Verify Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Activate System Access
            </DialogTitle>
            <DialogDescription>
              Configure system access for {currentEmployee.firstName} {currentEmployee.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="useEmailAsUsername" className="flex items-center gap-2">
                <Switch
                  id="useEmailAsUsername"
                  checked={activationData.useEmailAsUsername}
                  onCheckedChange={(checked) => 
                    setActivationData({...activationData, useEmailAsUsername: checked})
                  }
                />
                <span>Use email as username</span>
              </Label>
              {activationData.useEmailAsUsername && (
                <p className="text-sm text-gray-500">
                  Username will be: {currentEmployee.email.split('@')[0]}
                </p>
              )}
            </div>
            
            {!activationData.useEmailAsUsername && (
              <div className="space-y-2">
                <Label htmlFor="systemUsername">Username</Label>
                <Input
                  id="systemUsername"
                  placeholder="Enter username"
                  value={activationData.systemUsername}
                  onChange={(e) => 
                    setActivationData({...activationData, systemUsername: e.target.value})
                  }
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="systemRole">System Role</Label>
              <Select
                value={activationData.systemRole}
                onValueChange={(value) => 
                  setActivationData({...activationData, systemRole: value})
                }
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleActivateSystemAccess}
              disabled={isActivating || (!activationData.useEmailAsUsername && !activationData.systemUsername)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isActivating ? 'Activating...' : 'Activate System Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}