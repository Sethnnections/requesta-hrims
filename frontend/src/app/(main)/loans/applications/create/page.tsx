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
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useLoanStore } from '@/store/slices/loan-slice'
import { useAuthStore } from '@/store/slices/auth-slice'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Calculator, Upload, FileText } from 'lucide-react'

// Form validation schema
const loanApplicationSchema = z.object({
  loanType: z.string().min(1, 'Loan type is required'),
  amount: z.number().min(1000, 'Minimum amount is 1,000').max(100000000, 'Maximum amount is 100,000,000'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters').max(500, 'Purpose too long'),
  repaymentPeriod: z.number().min(1, 'Minimum repayment period is 1 month').max(240, 'Maximum repayment period is 240 months'),
  supportingDocuments: z.array(z.string()).optional(),
  metadata: z.object({
    priority: z.string().optional(),
    specialConditions: z.string().optional(),
  }).optional(),
})

type LoanApplicationFormData = z.infer<typeof loanApplicationSchema>

export default function CreateLoanApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { 
    loanTypes, 
    isLoading, 
    getLoanTypes,
    createLoanApplication 
  } = useLoanStore()
  
  const [selectedLoanType, setSelectedLoanType] = useState<string>('')
  const [monthlyRepayment, setMonthlyRepayment] = useState<number>(0)
  const [totalRepayment, setTotalRepayment] = useState<number>(0)
  const [totalInterest, setTotalInterest] = useState<number>(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      loanType: '',
      amount: 50000,
      purpose: '',
      repaymentPeriod: 12,
      metadata: {
        priority: 'normal',
        specialConditions: 'none',
      },
    },
  })

  useEffect(() => {
    loadLoanTypes()
  }, [])

  useEffect(() => {
    calculateRepayments()
  }, [watch('amount'), watch('repaymentPeriod'), selectedLoanType])

  const loadLoanTypes = async () => {
    try {
      await getLoanTypes({ isActive: true })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const calculateRepayments = () => {
    const amount = watch('amount')
    const period = watch('repaymentPeriod')
    const loanType = loanTypes.find(lt => lt.code === selectedLoanType)
    
    if (!loanType || !amount || !period) return

    const monthlyRate = loanType.interestRate / 100 / 12
    const monthlyPayment = 
      (amount * monthlyRate * Math.pow(1 + monthlyRate, period)) / 
      (Math.pow(1 + monthlyRate, period) - 1)
    
    const totalPayment = monthlyPayment * period
    const totalInterest = totalPayment - amount

    setMonthlyRepayment(Number(monthlyPayment.toFixed(2)))
    setTotalRepayment(Number(totalPayment.toFixed(2)))
    setTotalInterest(Number(totalInterest.toFixed(2)))
  }

  const getLoanTypeDetails = (code: string) => {
    return loanTypes.find(lt => lt.code === code)
  }

  const handleLoanTypeChange = (value: string) => {
    setSelectedLoanType(value)
    setValue('loanType', value)
    
    const loanType = getLoanTypeDetails(value)
    if (loanType) {
      // Set amount to minimum if current amount is less than minimum
      if (watch('amount') < loanType.minAmount) {
        setValue('amount', loanType.minAmount)
      }
      // Set amount to maximum if current amount is more than maximum
      if (watch('amount') > loanType.maxAmount) {
        setValue('amount', loanType.maxAmount)
      }
      // Adjust repayment period if needed
      if (watch('repaymentPeriod') < loanType.minRepaymentPeriod) {
        setValue('repaymentPeriod', loanType.minRepaymentPeriod)
      }
      if (watch('repaymentPeriod') > loanType.maxRepaymentPeriod) {
        setValue('repaymentPeriod', loanType.maxRepaymentPeriod)
      }
    }
  }

  const onSubmit = async (data: LoanApplicationFormData) => {
    if (!user?.employeeId) {
      toast({
        title: 'Error',
        description: 'Employee information not found',
        variant: 'error',
      })
      return
    }

    try {
      const loanData = {
        employeeId: user.employeeId,
        ...data,
        currency: 'MWK',
        supportingDocuments: data.supportingDocuments || [],
      }

      const loan = await createLoanApplication(loanData)
      
      toast({
        title: 'Success',
        description: 'Loan application submitted successfully',
      })
      
      router.push(`/loans/applications/${loan.id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    }
  }

  const loanType = getLoanTypeDetails(selectedLoanType)
  const amount = watch('amount')
  const period = watch('repaymentPeriod')

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
          <h1 className="text-3xl font-bold text-requesta-primary">Apply for Loan</h1>
          <p className="text-gray-600">Submit a new loan application</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Loan Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>Select loan type and enter basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type *</Label>
                  <Select 
                    value={selectedLoanType} 
                    onValueChange={handleLoanTypeChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTypes.map((type) => (
                        <SelectItem key={type._id} value={type.code}>
                          <div className="flex flex-col">
                            <span>{type.name}</span>
                            <span className="text-xs text-gray-500">
                              {formatCurrency(type.minAmount, 'MWK')} - {formatCurrency(type.maxAmount, 'MWK')} • {type.interestRate}% interest
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.loanType && (
                    <p className="text-sm text-red-500">{errors.loanType.message}</p>
                  )}
                </div>

                {loanType && (
                  <Card className="border-requesta-primary/20 bg-requesta-background">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Interest Rate</span>
                          <span className="font-semibold text-requesta-primary">{loanType.interestRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Processing Fee</span>
                          <span className="font-semibold">{loanType.processingFee}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Eligible for your grade</span>
                          <span className={`font-semibold ${
                            loanType.eligibleGrades.includes(user?.profile?.employee?.gradeId || '') 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {loanType.eligibleGrades.includes(user?.profile?.employee?.gradeId || '') ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {loanType.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Loan Amount (MWK) *
                    {loanType && (
                      <span className="ml-2 text-sm text-gray-500">
                        Min: {formatCurrency(loanType.minAmount, 'MWK')} • Max: {formatCurrency(loanType.maxAmount, 'MWK')}
                      </span>
                    )}
                  </Label>
                  <div className="space-y-4">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      {...register('amount', { valueAsNumber: true })}
                    />
                    {loanType && (
                      <Slider
                        defaultValue={[loanType.minAmount]}
                        min={loanType.minAmount}
                        max={loanType.maxAmount}
                        step={1000}
                        value={[amount]}
                        onValueChange={([value]: number[]) => setValue('amount', value)}
                        className="w-full"
                      />
                    )}
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repaymentPeriod">
                    Repayment Period (Months) *
                    {loanType && (
                      <span className="ml-2 text-sm text-gray-500">
                        Min: {loanType.minRepaymentPeriod} • Max: {loanType.maxRepaymentPeriod}
                      </span>
                    )}
                  </Label>
                  <div className="space-y-4">
                    <Input
                      id="repaymentPeriod"
                      type="number"
                      placeholder="Enter months"
                      {...register('repaymentPeriod', { valueAsNumber: true })}
                    />
                    {loanType && (
                      <Slider
                        defaultValue={[loanType.minRepaymentPeriod]}
                        min={loanType.minRepaymentPeriod}
                        max={loanType.maxRepaymentPeriod}
                        step={1}
                        value={[period]}
                        onValueChange={([value]: number[]) => setValue('repaymentPeriod', value)}
                        className="w-full"
                      />
                    )}
                  </div>
                  {errors.repaymentPeriod && (
                    <p className="text-sm text-red-500">{errors.repaymentPeriod.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Loan *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Describe what you need the loan for..."
                    rows={4}
                    {...register('purpose')}
                  />
                  {errors.purpose && (
                    <p className="text-sm text-red-500">{errors.purpose.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Be specific about how you plan to use the funds
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Supporting Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
                <CardDescription>Upload required documents for your loan application</CardDescription>
              </CardHeader>
              <CardContent>
                {loanType ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Required Documents</Label>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {loanType.requiredDocuments.map((doc, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            {doc.replace('_', ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        Upload Documents
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag & drop or click to browse files
                      </p>
                      <Button type="button" variant="outline">
                        Browse Files
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Select a loan type to see required documents
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Loan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Loan Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Loan Amount</span>
                    <span className="font-semibold">{formatCurrency(amount, 'MWK')}</span>
                  </div>
                  
                  {loanType && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Processing Fee ({loanType.processingFee}%)</span>
                        <span className="font-semibold">
                          {formatCurrency(amount * loanType.processingFee / 100, 'MWK')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Interest Rate</span>
                        <span className="font-semibold text-requesta-primary">
                          {loanType.interestRate}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Interest</span>
                        <span className="font-semibold">
                          {formatCurrency(totalInterest, 'MWK')}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Repayment</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(monthlyRepayment, 'MWK')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Repayment</span>
                    <span className="font-bold text-requesta-primary">
                      {formatCurrency(totalRepayment, 'MWK')}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Term</span>
                      <span>{period} months</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loanType?.termsAndConditions ? (
                  <div className="space-y-2 text-sm text-gray-600">
                    {Object.entries(loanType.termsAndConditions).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-1.5"></div>
                        <span>
                          <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select a loan type to view terms and conditions
                  </p>
                )}
                
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 text-xs">!</span>
                  </div>
                  <p className="text-sm text-yellow-800">
                    By submitting this application, you agree to the terms and conditions of the loan.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-requesta-primary hover:bg-requesta-primary-light"
                  disabled={isSubmitting || isLoading || !selectedLoanType}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Loan Application'}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Your application will be reviewed by the HR department
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}