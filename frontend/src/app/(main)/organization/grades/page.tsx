'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Trash,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Grade, PaginatedResponse } from '@/types/organization/grade'

const columns = [
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }: any) => (
      <Badge variant="outline">Level {row.getValue('level')}</Badge>
    ),
  },
  {
    accessorKey: 'band',
    header: 'Band',
    cell: ({ row }: any) => {
      const band = row.getValue('band')
      const variants: Record<string, string> = {
        'JUNIOR': 'default',
        'OPERATIONAL': 'secondary',
        'SUPERVISORY': 'outline',
        'MANAGERIAL': 'destructive',
        'EXECUTIVE': 'default',
      }
      return (
        <Badge variant={variants[band] as any}>{band}</Badge>
      )
    },
  },
  {
    accessorKey: 'compensation.basicSalary',
    header: 'Salary Range',
    cell: ({ row }: any) => {
      const salary = row.getValue('compensation.basicSalary')
      return (
        <div>
          {salary?.min?.toLocaleString()} - {salary?.max?.toLocaleString()}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }: any) => {
      const grade = row.original
      const router = useRouter()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/organization/grades/${grade._id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/organization/grades/${grade._id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function GradesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchGrades = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/v1/grades?page=${page}&limit=${pagination.limit}&search=${search}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      
      if (!response.ok) throw new Error('Failed to fetch grades')
      
      const data: PaginatedResponse<Grade> = await response.json()
      setGrades(data.data)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGrades()
  }, [search])

  const handlePageChange = (page: number) => {
    fetchGrades(page)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground">
            Manage employee grades and compensation levels
          </p>
        </div>
        <Button onClick={() => router.push('/organization/grades/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Grade
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Grades</TabsTrigger>
            <TabsTrigger value="junior">Junior</TabsTrigger>
            <TabsTrigger value="managerial">Managerial</TabsTrigger>
            <TabsTrigger value="executive">Executive</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search grades..."
                className="pl-8 w-[250px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade List</CardTitle>
              <CardDescription>
                A list of all grades in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={grades}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all bands
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Base Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              MWK {Math.round(grades.reduce((sum, grade) => {
                const mid = grade.compensation?.basicSalary?.mid || 0
                return sum + mid
              }, 0) / Math.max(grades.length, 1)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average mid-point
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.length > 0 ? Math.max(...grades.map(g => g.level)) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.length > 0 ? Math.min(...grades.map(g => g.level)) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum level
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}