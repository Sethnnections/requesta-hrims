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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLoanStore } from '@/store/slices/loan-slice'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  Banknote, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Printer,
  Share2
} from 'lucide-react'

export default function LoanApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const loanId = params.id as string
  
  const {
    currentLoanApplication,
    isLoading,
    getLoanApplicationById,
    disburseLoan,
    cancelLoan,
  } = useLoanStore()
  
  const [activeTab, setActiveTab] = useState('details')
  const [isDisburseDialogOpen, setIsDisburseDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [disbursementDate, setDisbursementDate] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')

  useEffect(() => {
    if (loanId) {
      loadLoanApplication()
    }
  }, [loanId])

  const loadLoanApplication = async () => {
    try {
      await getLoanApplicationById(loanId)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const handleDisburseLoan = async () => {
    try {
      await disburseLoan(loanId, {
        disbursementDate: disbursementDate || new Date().toISOString(),
      })
      
      toast({
        title: 'Success',
        description: 'Loan has been disbursed successfully',
      })
      
      setIsDisburseDialogOpen(false)
      loadLoanApplication()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const handleCancelLoan = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a cancellation reason',
        variant: 'error',
      })
      return
    }

    try {
      await cancelLoan(loanId, {
        reason: cancellationReason,
      })
      
      toast({
        title: 'Success',
        description: 'Loan application has been cancelled',
      })
      
      setIsCancelDialogOpen(false)
      loadLoanApplication()
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
      case 'DRAFT':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'SUBMITTED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Submitted</Badge>
      case 'UNDER_REVIEW':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
      case 'PENDING_APPROVAL':
        return <Badge className="bg-orange-100 text-orange-800">Pending Approval</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>
      case 'DISBURSED':
        return <Badge className="bg-purple-100 text-purple-800">Disbursed</Badge>
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const canDisburse = currentLoanApplication?.status === 'APPROVED'
  const canCancel = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(currentLoanApplication?.status || '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!currentLoanApplication) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">Loan application not found</div>
        <Button onClick={() => router.push('/loans/applications')}>
          Back to Applications
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
            onClick={() => router.push('/loans/applications')}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-requesta-primary">
              Loan Application #{currentLoanApplication.id.slice(-8)}
            </h1>
            <p className="text-gray-600">
              {currentLoanApplication.loanType.replace('_', ' ')} • {formatCurrency(currentLoanApplication.amount, currentLoanApplication.currency)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          {canDisburse && (
            <Dialog open={isDisburseDialogOpen} onOpenChange={setIsDisburseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Banknote className="h-4 w-4 mr-2" />
                  Disburse Loan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disburse Loan</DialogTitle>
                  <DialogDescription>
                    Mark this approved loan as disbursed and create repayment schedule.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="disbursementDate">Disbursement Date</Label>
                    <Input
                      id="disbursementDate"
                      type="date"
                      value={disbursementDate}
                      onChange={(e) => setDisbursementDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDisburseDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDisburseLoan} className="bg-green-600 hover:bg-green-700">
                    Confirm Disbursement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {canCancel && (
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Loan Application</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Please provide a reason for cancellation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancellationReason">Cancellation Reason *</Label>
                    <Textarea
                      id="cancellationReason"
                      placeholder="Enter reason for cancellation..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                    Go Back
                  </Button>
                  <Button variant="destructive" onClick={handleCancelLoan}>
                    Confirm Cancellation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-requesta-primary/10 rounded-full">
                <Banknote className="h-5 w-5 text-requesta-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Loan Amount</div>
                <div className="text-xl font-bold text-requesta-primary">
                  {formatCurrency(currentLoanApplication.amount, currentLoanApplication.currency)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div>{getStatusBadge(currentLoanApplication.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Monthly Payment</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(currentLoanApplication.monthlyRepayment, currentLoanApplication.currency)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium">
                  {formatDate(currentLoanApplication.createdAt, 'display')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="repayment">Repayment</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applicant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(`${currentLoanApplication.employee.firstName} ${currentLoanApplication.employee.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>Applicant Information</div>
                    <CardDescription>Employee details</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Full Name</div>
                  <div className="font-medium">
                    {currentLoanApplication.employee.firstName} {currentLoanApplication.employee.lastName}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Employee Number</div>
                  <div className="font-medium font-mono">
                    {currentLoanApplication.employee.employeeNumber}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Grade</div>
                  <div className="font-medium">
                    {currentLoanApplication.employee.gradeCode}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  <div>
                    <div>Loan Details</div>
                    <CardDescription>Application information</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Loan Type</div>
                      <div className="font-medium">
                        {currentLoanApplication.loanType.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Amount</div>
                      <div className="text-2xl font-bold text-requesta-primary">
                        {formatCurrency(currentLoanApplication.amount, currentLoanApplication.currency)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Repayment Period</div>
                      <div className="font-medium">
                        {currentLoanApplication.repaymentPeriod} months
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Interest Rate</div>
                      <div className="font-medium">
                        {currentLoanApplication.interestRate}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Monthly Repayment</div>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(currentLoanApplication.monthlyRepayment, currentLoanApplication.currency)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Total Repayment</div>
                      <div className="text-xl font-bold text-requesta-primary">
                        {formatCurrency(currentLoanApplication.totalRepayment, currentLoanApplication.currency)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Total Interest</div>
                      <div className="font-medium">
                        {formatCurrency(currentLoanApplication.totalRepayment - currentLoanApplication.amount, currentLoanApplication.currency)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Application Date</div>
                      <div className="font-medium">
                        {formatDate(currentLoanApplication.createdAt, 'display')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Purpose</div>
                    <div className="font-medium">
                      {currentLoanApplication.purpose}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Application Submitted</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(currentLoanApplication.createdAt, 'displayWithTime')}
                    </div>
                  </div>
                </div>
                
                {currentLoanApplication.updatedAt !== currentLoanApplication.createdAt && (
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Last Updated</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(currentLoanApplication.updatedAt, 'displayWithTime')}
                      </div>
                    </div>
                  </div>
                )}
                
                {currentLoanApplication.disbursementDate && (
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Banknote className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Loan Disbursed</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(currentLoanApplication.disbursementDate, 'displayWithTime')}
                      </div>
                    </div>
                  </div>
                )}
                
                {currentLoanApplication.cancellationReason && (
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">Application Cancelled</div>
                      <div className="text-sm text-gray-500">
                        {currentLoanApplication.cancellationReason}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>Documents submitted with this application</CardDescription>
            </CardHeader>
            <CardContent>
              {currentLoanApplication.supportingDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentLoanApplication.supportingDocuments.map((doc, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-requesta-primary/10 rounded-full">
                            <FileText className="h-5 w-5 text-requesta-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              Document {index + 1}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {doc.split('/').pop()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(doc, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500">No documents uploaded</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repayment Tab */}
        <TabsContent value="repayment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Repayment Schedule</CardTitle>
              <CardDescription>Monthly repayment breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-requesta-primary">
                        {formatCurrency(currentLoanApplication.monthlyRepayment, currentLoanApplication.currency)}
                      </div>
                      <div className="text-sm text-gray-500">Monthly Payment</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">
                        {currentLoanApplication.repaymentPeriod}
                      </div>
                      <div className="text-sm text-gray-500">Total Months</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(currentLoanApplication.totalRepayment, currentLoanApplication.currency)}
                      </div>
                      <div className="text-sm text-gray-500">Total Repayment</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="font-medium">Amortization Schedule</div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Month</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Principal</th>
                          <th className="px4 py-3 text-left text-sm font-medium text-gray-700">Interest</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Remaining</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {/* Simplified schedule - in real app, calculate full schedule */}
                        {Array.from({ length: Math.min(12, currentLoanApplication.repaymentPeriod) }).map((_, i) => {
                          const month = i + 1
                          const interest = (currentLoanApplication.amount * currentLoanApplication.interestRate / 100 / 12)
                          const principal = currentLoanApplication.monthlyRepayment - interest
                          const remaining = currentLoanApplication.amount - (principal * month)
                          
                          return (
                            <tr key={month} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{month}</td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {formatCurrency(currentLoanApplication.monthlyRepayment, currentLoanApplication.currency)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {formatCurrency(principal, currentLoanApplication.currency)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {formatCurrency(interest, currentLoanApplication.currency)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {formatCurrency(remaining > 0 ? remaining : 0, currentLoanApplication.currency)}
                              </td>
                            </tr>
                          )
                        })}
                        
                        {currentLoanApplication.repaymentPeriod > 12 && (
                          <tr className="bg-gray-50">
                            <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                              ... and {currentLoanApplication.repaymentPeriod - 12} more months
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}