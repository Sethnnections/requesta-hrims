'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/slices/auth-slice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Users, FileText, BarChart, ArrowUpRight, Clock, Banknote, Plane } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()


  const stats = [
    {
      title: 'Pending Approvals',
      value: '3',
      icon: FileText,
      color: 'bg-requesta-accent',
      href: '/workflows/approvals',
    },
    {
      title: 'Team Members',
      value: '8',
      icon: Users,
      color: 'bg-requesta-secondary',
      href: '/employees/directory',
    },
    {
      title: 'Active Loans',
      value: '2',
      icon: Banknote,
      color: 'bg-requesta-primary',
      href: '/loans/applications',
    },
    {
      title: 'Travel Requests',
      value: '1',
      icon: Plane,
      color: 'bg-requesta-primary-light',
      href: '/travel/requests',
    },
    {
      title: 'Overtime Claims',
      value: '4',
      icon: Clock,
      color: 'bg-requesta-accent-light',
      href: '/overtime/claims',
    },
    {
      title: 'Reports Generated',
      value: '12',
      icon: BarChart,
      color: 'bg-requesta-secondary/80',
      href: '/reports',
    },
  ]

  const quickActions = [
    { label: 'Apply for Loan', href: '/loans/applications/create', icon: Banknote },
    { label: 'Request Travel', href: '/travel/requests/create', icon: Plane },
    { label: 'Claim Overtime', href: '/overtime/claims/create', icon: Clock },
    { label: 'View Payslip', href: '/payroll/payslips', icon: FileText },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-requesta-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {user.username}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your requests today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-requesta-primary/10 px-3 py-1 text-sm font-medium text-requesta-primary">
            <Briefcase className="mr-1 h-4 w-4" />
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4 justify-between"
                onClick={() => router.push(stat.href)}
              >
                View Details
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & User Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-4 justify-start hover:bg-requesta-background hover:border-requesta-primary"
                  onClick={() => router.push(action.href)}
                >
                  <action.icon className="mr-3 h-5 w-5 text-requesta-primary" />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-requesta-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{user.username}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Employee ID:</span>
                <span className="font-medium">{user.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Permissions:</span>
                <span className="font-medium">{user.permissions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Login:</span>
                <span className="font-medium">Today</span>
              </div>
            </div>

            <Button 
              variant="requesta-outline" 
              className="w-full mt-4"
              onClick={() => router.push('/profile')}
            >
              View Full Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest requests and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p>No recent activity to display</p>
            <p className="text-sm mt-2">Your recent requests and approvals will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}