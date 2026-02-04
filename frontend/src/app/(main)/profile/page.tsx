'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building,
  Award,
  Shield,
  Clock,
  Edit,
  Save,
  Camera,
  Lock,
  AlertCircle,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { useProfileStore } from '@/store/slices/profile-slice'
import { useAuthStore } from '@/store/slices/auth-slice'
import { format } from 'date-fns'

// Validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
})

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  relationship: z.string().min(2, 'Relationship must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { toast } = useToast()
  const { user: authUser } = useAuthStore()
  const { 
    profile, 
    isLoading, 
    error, 
    fetchProfile, 
    updateProfile, 
    changePassword,
    uploadAvatar 
  } = useProfileStore()

  // Form states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingEmergency, setIsEditingEmergency] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Personal info form
  const personalForm = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
    },
  })

  // Emergency contact form
  const emergencyForm = useForm<EmergencyContactFormData>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: '',
      relationship: '',
      phone: '',
      address: '',
    },
  })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Update form values when profile loads
  useEffect(() => {
    if (profile?.employee) {
      personalForm.reset({
        firstName: profile.employee.firstName || '',
        lastName: profile.employee.lastName || '',
        email: profile.email || authUser?.email || '',
        phone: profile.employee.phone || profile.phone || '',
        dateOfBirth: profile.employee.dateOfBirth || profile.dateOfBirth || '',
        address: profile.employee.address || profile.address || '',
      })
    } else if (profile) {
      personalForm.reset({
        firstName: '',
        lastName: '',
        email: profile.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
      })
    }

    if (profile?.employee?.emergencyContact) {
      emergencyForm.reset({
        name: profile.employee.emergencyContact.name || '',
        relationship: profile.employee.emergencyContact.relationship || '',
        phone: profile.employee.emergencyContact.phone || '',
        address: profile.employee.emergencyContact.address || '',
      })
    }
  }, [profile, personalForm, emergencyForm, authUser])

  // Handle personal info update
  const handlePersonalInfoSubmit = async (data: PersonalInfoFormData) => {
    try {
      await updateProfile(data)
      setIsEditingPersonal(false)
      toast({
        title: 'Profile Updated',
        description: 'Your personal information has been updated successfully.',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'error',
      })
    }
  }

  // Handle emergency contact update
  const handleEmergencyContactSubmit = async (data: EmergencyContactFormData) => {
    try {
      await updateProfile({
        emergencyContact: data,
      })
      setIsEditingEmergency(false)
      toast({
        title: 'Emergency Contact Updated',
        description: 'Your emergency contact has been updated successfully.',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'error',
      })
    }
  }

  // Handle password change
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword)
      passwordForm.reset()
      setIsChangingPassword(false)
      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully.',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Password Change Failed',
        description: error.message,
        variant: 'error',
      })
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    try {
      await uploadAvatar(avatarFile)
      setAvatarFile(null)
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated successfully.',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'error',
      })
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-requesta-primary"></div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const employee = profile?.employee
  const formattedLastLogin = profile?.lastLoginAt 
    ? format(new Date(profile.lastLoginAt), 'PPpp')
    : 'Never'

  const displayName = employee 
    ? `${employee.firstName} ${employee.lastName}`
    : profile?.username || authUser?.username || 'User'

  const initials = employee 
    ? `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`
    : profile?.username?.[0] || authUser?.username?.[0] || 'U'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
        </div>
        <Badge variant="outline" className="text-requesta-primary">
          <Shield className="mr-2 h-4 w-4" />
          {profile?.role?.replace('_', ' ') || authUser?.role?.replace('_', ' ')}
        </Badge>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-requesta-primary/20">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="bg-requesta-primary text-white text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])}
                />
                <div className="bg-requesta-primary text-white p-2 rounded-full hover:bg-requesta-primary-light">
                  <Camera className="h-4 w-4" />
                </div>
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h2>
                <p className="text-gray-600">{profile?.email || authUser?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {employee?.employeeNumber && (
                    <Badge variant="secondary" className="text-xs">
                      <Briefcase className="mr-1 h-3 w-3" />
                      Employee ID: {employee.employeeNumber}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {employee?.employmentStatus || profile?.status || 'ACTIVE'}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-requesta-background rounded-lg">
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold text-requesta-primary">
                    {profile?.role?.replace('_', ' ') || authUser?.role?.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-center p-3 bg-requesta-background rounded-lg">
                  <p className="text-sm text-gray-600">Permissions</p>
                  <p className="font-semibold text-requesta-primary">
                    {profile?.permissions?.length || authUser?.permissions?.length || 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-requesta-background rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">
                    {profile?.status || 'active'}
                  </p>
                </div>
                <div className="text-center p-3 bg-requesta-background rounded-lg">
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-semibold text-requesta-primary text-xs">
                    {formattedLastLogin}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Upload Button */}
          {avatarFile && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">New avatar selected</p>
                    <p className="text-sm text-gray-600">{avatarFile.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAvatarFile(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="requesta"
                    size="sm"
                    onClick={handleAvatarUpload}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Uploading...' : 'Upload Avatar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                <Button
                  variant={isEditingPersonal ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                >
                  {isEditingPersonal ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...personalForm.register('firstName')}
                      disabled={!isEditingPersonal}
                      icon={User}
                    />
                    {personalForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...personalForm.register('lastName')}
                      disabled={!isEditingPersonal}
                      icon={User}
                    />
                    {personalForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...personalForm.register('email')}
                      disabled={!isEditingPersonal}
                      icon={Mail}
                    />
                    {personalForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {personalForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...personalForm.register('phone')}
                      disabled={!isEditingPersonal}
                      icon={Phone}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...personalForm.register('dateOfBirth')}
                      disabled={!isEditingPersonal}
                      icon={Calendar}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...personalForm.register('address')}
                    disabled={!isEditingPersonal}
                    rows={3}
                  />
                </div>

                {isEditingPersonal && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingPersonal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="requesta">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Information Tab */}
        <TabsContent value="employment">
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>Your company and job details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {employee?.employeeNumber && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-requesta-background rounded-lg">
                          <Briefcase className="h-5 w-5 text-requesta-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Employee Number</p>
                          <p className="font-medium">{employee.employeeNumber}</p>
                        </div>
                      </div>
                    )}

                    {employee?.departmentId && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-requesta-background rounded-lg">
                          <Building className="h-5 w-5 text-requesta-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium">{employee.departmentId}</p>
                        </div>
                      </div>
                    )}

                    {employee?.positionId && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-requesta-background rounded-lg">
                          <Award className="h-5 w-5 text-requesta-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Position</p>
                          <p className="font-medium">{employee.positionId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {employee?.gradeId && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-requesta-background rounded-lg">
                          <Shield className="h-5 w-5 text-requesta-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Grade</p>
                          <p className="font-medium">{employee.gradeId}</p>
                        </div>
                      </div>
                    )}

                    {employee?.employmentStatus && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-requesta-background rounded-lg">
                          <Clock className="h-5 w-5 text-requesta-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Employment Status</p>
                          <Badge variant={
                            employee.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'
                          }>
                            {employee.employmentStatus}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {profile?.permissions && profile.permissions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Permissions</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contact Tab */}
        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Update your emergency contact information</CardDescription>
                </div>
                <Button
                  variant={isEditingEmergency ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setIsEditingEmergency(!isEditingEmergency)}
                >
                  {isEditingEmergency ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={emergencyForm.handleSubmit(handleEmergencyContactSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input
                      id="emergencyName"
                      {...emergencyForm.register('name')}
                      disabled={!isEditingEmergency}
                      icon={User}
                    />
                    {emergencyForm.formState.errors.name && (
                      <p className="text-sm text-red-600">
                        {emergencyForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      {...emergencyForm.register('relationship')}
                      disabled={!isEditingEmergency}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                    {emergencyForm.formState.errors.relationship && (
                      <p className="text-sm text-red-600">
                        {emergencyForm.formState.errors.relationship.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Phone Number</Label>
                    <Input
                      id="emergencyPhone"
                      {...emergencyForm.register('phone')}
                      disabled={!isEditingEmergency}
                      icon={Phone}
                    />
                    {emergencyForm.formState.errors.phone && (
                      <p className="text-sm text-red-600">
                        {emergencyForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyAddress">Contact Address</Label>
                  <Textarea
                    id="emergencyAddress"
                    {...emergencyForm.register('address')}
                    disabled={!isEditingEmergency}
                    rows={3}
                  />
                </div>

                {isEditingEmergency && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingEmergency(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="requesta">
                      <Save className="mr-2 h-4 w-4" />
                      Save Emergency Contact
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and security preferences</CardDescription>
                </div>
                <Button
                  variant={isChangingPassword ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  {isChangingPassword ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register('currentPassword')}
                      icon={Lock}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register('newPassword')}
                      icon={Lock}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                      icon={Lock}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false)
                        passwordForm.reset()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="requesta">
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your account security is important. Make sure to use a strong, unique password.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-requesta-background rounded-lg">
                          <Mail className="h-5 w-5 text-requesta-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-gray-600">
                            {profile?.emailVerified ? 'Verified' : 'Not Verified'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={profile?.emailVerified ? "default" : "secondary"}>
                        {profile?.emailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-requesta-background rounded-lg">
                          <Clock className="h-5 w-5 text-requesta-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Last Password Change</p>
                          <p className="text-sm text-gray-600">
                            {profile?.updatedAt ? format(new Date(profile.updatedAt), 'PP') : 'Never'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Update Available</Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}