'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoanStore } from '@/store/slices/loan-slice'
import { useAuthStore } from '@/store/slices/auth-slice'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { Search, Filter, Eye, PlusCircle, Download, RefreshCw } from 'lucide-react'

export default function LoanApplicationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const {
    loanApplications = [],
    pagination,
    filters,
    isLoading,
    getLoanApplications,
    setFilters,
  } = useLoanStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedLoanType, setSelectedLoanType] = useState<string>('all')

  useEffect(() => {
    loadLoanApplications()
  }, [pagination.page, selectedStatus, selectedLoanType])

  const loadLoanApplications = async () => {
    try {
      await getLoanApplications({
        page: pagination.page,
        limit: pagination.limit,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        loanType: selectedLoanType !== 'all' ? selectedLoanType : undefined,
        employeeId: user?.employeeId,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const handleSearch = () => {
    // Implement search functionality if needed
    loadLoanApplications()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedStatus('all')
    setSelectedLoanType('all')
    setFilters({})
    loadLoanApplications()
  }

  const handleViewLoan = (loanId: string) => {
    router.push(`/loans/applications/${loanId}`)
  }

  const handleCreateLoan = () => {
    router.push('/loans/applications/create')
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

  const getLoanTypeColor = (loanType: string) => {
    const typeColors: Record<string, string> = {
      'PERSONAL': 'bg-blue-100 text-blue-800',
      'HOUSING': 'bg-green-100 text-green-800',
      'EDUCATION': 'bg-purple-100 text-purple-800',
      'EMERGENCY': 'bg-red-100 text-red-800',
      'VEHICLE': 'bg-orange-100 text-orange-800',
      'BUSINESS': 'bg-indigo-100 text-indigo-800',
      'AGRICULTURE': 'bg-lime-100 text-lime-800',
      'MEDICAL': 'bg-pink-100 text-pink-800',
      'WEDDING': 'bg-rose-100 text-rose-800',
      'FURNITURE': 'bg-amber-100 text-amber-800',
      'EXECUTIVE': 'bg-cyan-100 text-cyan-800',
      'SALARY_ADVANCE': 'bg-teal-100 text-teal-800',
    }
    
    return typeColors[loanType] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-requesta-primary">Loan Applications</h1>
          <p className="text-gray-600">Manage and track all loan applications</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={loadLoanApplications}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleCreateLoan}
            className="bg-requesta-primary hover:bg-requesta-primary-light"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Apply for Loan
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-requesta-primary">
              {loanApplications.length}
            </div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {loanApplications.filter(l => l.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {loanApplications.filter(l => l.status === 'PENDING_APPROVAL' || l.status === 'UNDER_REVIEW').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                loanApplications.reduce((sum, loan) => sum + loan.amount, 0),
                'MWK'
              )}
            </div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by purpose or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="DISBURSED">Disbursed</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Loan Type</label>
              <Select value={selectedLoanType} onValueChange={setSelectedLoanType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                  <SelectItem value="HOUSING">Housing Loan</SelectItem>
                  <SelectItem value="EDUCATION">Education Loan</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency Loan</SelectItem>
                  <SelectItem value="VEHICLE">Vehicle Loan</SelectItem>
                  <SelectItem value="BUSINESS">Business Loan</SelectItem>
                  <SelectItem value="AGRICULTURE">Agriculture Loan</SelectItem>
                  <SelectItem value="MEDICAL">Medical Loan</SelectItem>
                  <SelectItem value="WEDDING">Wedding Loan</SelectItem>
                  <SelectItem value="FURNITURE">Furniture Loan</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive Loan</SelectItem>
                  <SelectItem value="SALARY_ADVANCE">Salary Advance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            Showing {loanApplications.length} of {pagination.total} applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : loanApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No loan applications found</div>
              <Button 
                onClick={handleCreateLoan}
                className="bg-requesta-primary hover:bg-requesta-primary-light"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Apply for your first loan
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanApplications.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(`${loan.employee.firstName} ${loan.employee.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {loan.employee.firstName} {loan.employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {loan.employee.employeeNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            <Badge className={getLoanTypeColor(loan.loanType)}>
                              {loan.loanType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {loan.purpose}
                          </div>
                          <div className="text-xs text-gray-400">
                            {loan.repaymentPeriod} months • {loan.interestRate}% interest
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-bold text-requesta-primary">
                            {formatCurrency(loan.amount, loan.currency)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Monthly: {formatCurrency(loan.monthlyRepayment, loan.currency)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(loan.createdAt, 'display')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLoan(loan.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          {loan.supportingDocuments.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(loan.supportingDocuments[0], '_blank')}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrevPage || isLoading}
                    onClick={() => getLoanApplications({ page: pagination.page - 1 })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNextPage || isLoading}
                    onClick={() => getLoanApplications({ page: pagination.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}