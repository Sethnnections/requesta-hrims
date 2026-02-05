'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building, Users, TrendingUp, Network, ArrowRight } from 'lucide-react'

export default function OrganizationPage() {
  const router = useRouter()

  const cards = [
    {
      title: 'Departments',
      description: 'Manage organizational departments and hierarchy',
      icon: Building,
      href: '/organization/departments',
      color: 'bg-blue-500',
    },
    {
      title: 'Positions',
      description: 'Manage job positions and availability',
      icon: Users,
      href: '/organization/positions',
      color: 'bg-green-500',
    },
    {
      title: 'Grades',
      description: 'Manage employee grades and compensation',
      icon: TrendingUp,
      href: '/organization/grades',
      color: 'bg-purple-500',
    },
    {
      title: 'Structure',
      description: 'View organizational hierarchy and relationships',
      icon: Network,
      href: '/organization/structure',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
        <p className="text-muted-foreground">
          Manage your organization's structure, positions, and grades
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="group cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-full ${card.color} text-white`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{card.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {card.description}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => router.push(card.href)}
                >
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Organization Overview</CardTitle>
            <CardDescription>
              Quick overview of your organizational structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Total Departments</p>
                    <p className="text-sm text-muted-foreground">Active departments in your organization</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">12</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Active Positions</p>
                    <p className="text-sm text-muted-foreground">Positions with available openings</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">45</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Grade Levels</p>
                    <p className="text-sm text-muted-foreground">Different grade levels defined</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">8</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common organization management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/organization/departments/create')}
            >
              <Building className="mr-2 h-4 w-4" />
              Add Department
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/organization/positions/create')}
            >
              <Users className="mr-2 h-4 w-4" />
              Add Position
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/organization/grades/create')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Add Grade
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/organization/structure')}
            >
              <Network className="mr-2 h-4 w-4" />
              View Structure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}