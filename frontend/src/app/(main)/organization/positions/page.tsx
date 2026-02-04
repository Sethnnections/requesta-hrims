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
  Briefcase,
  Users,
  DollarSign,
  Building,
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
import { Position, PaginatedResponse } from '@/types/organization/positions'

const columns = [
  {
    accessorKey: 'positionCode',
    header: 'Code',
  },
  {
    accessorKey: 'positionTitle',
    header: 'Title',
  },
  {
    accessorKey: 'department.departmentName',
    header: 'Department',
    cell: ({ row }: any) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue('department.departmentName')}
      </Badge>
    ),
  },
  {
    accessorKey: 'grade.code',
    header: 'Grade',
    cell: ({ row }: any) => (
      <Badge variant="secondary">{row.getValue('grade.code')}</Badge>
    ),
  },
  {
    accessorKey: 'availablePositions',
    header: 'Availability',
    cell: ({ row }: any) => {
      const available = row.getValue('availablePositions')
      const total = row.original.numberOfPositions
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${available > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${(available / total) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium">
            {available}/{total}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'isSupervisorRole',
    header: 'Role',
    cell: ({ row }: any) => {
      const position = row.original
      if (position.isDirectorRole) return <Badge variant="destructive">Director</Badge>
      if (position.isManagerRole) return <Badge variant="default">Manager</Badge>
      if (position.isSupervisorRole) return <Badge variant="secondary">Supervisor</Badge>
      return <Badge variant="outline">Employee</Badge>
    },
  },
  {
    id: 'actions',
    cell: ({ row }: any) => {
      const position = row.original
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
            <DropdownMenuItem onClick={() => router.push(`/organization/positions/${position._id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/organization/positions/${position._id}/edit`)}>
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

export default function PositionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchPositions = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/v1/positions?page=${page}&limit=${pagination.limit}&search=${search}&hasVacancies=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      
      if (!response.ok) throw new Error('Failed to fetch positions')
      
      const data: PaginatedResponse<Position> = await response.json()
      setPositions(data.data)
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
    fetchPositions()
  }, [search])

  const handlePageChange = (page: number) => {
    fetchPositions(page)
  }

  const totalAvailable = positions.reduce((sum, pos) => sum + pos.availablePositions, 0)
  const totalPositions = positions.reduce((sum, pos) => sum + pos.numberOfPositions, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
          <p className="text-muted-foreground">
            Manage job positions and their availability
          </p>
        </div>
        <Button onClick={() => router.push('/organization/positions/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Positions</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="filled">Filled</TabsTrigger>
            <TabsTrigger value="supervisory">Supervisory</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
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
              <CardTitle>Position List</CardTitle>
              <CardDescription>
                A list of all positions in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={positions}
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
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPositions}</div>
            <p className="text-xs text-muted-foreground">
              {totalAvailable} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Filled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPositions - totalAvailable}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPositions - totalAvailable) / totalPositions * 100).toFixed(1)}% filled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(positions.map(p => p.departmentId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              With active positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervisory Roles</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions.filter(p => p.isSupervisorRole || p.isManagerRole || p.isDirectorRole).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Leadership positions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}