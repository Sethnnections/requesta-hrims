'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  Building,
  Users,
  TrendingUp,
  Network,
  Map,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

export default function OrganizationStructurePage() {
  const { toast } = useToast()
  const [activeView, setActiveView] = useState('departments')
  const [search, setSearch] = useState('')
  const [zoom, setZoom] = useState(1)

  const handleExport = () => {
    toast({
      title: 'Export started',
      description: 'Your organization chart is being exported to PDF',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Structure</h1>
          <p className="text-muted-foreground">
            Visualize your organization's hierarchy and relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="departments">
              <Building className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="positions">
              <Users className="h-4 w-4 mr-2" />
              Positions
            </TabsTrigger>
            <TabsTrigger value="hierarchy">
              <Network className="h-4 w-4 mr-2" />
              Full Hierarchy
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search structure..."
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

        <TabsContent value="departments" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Department Hierarchy
                </CardTitle>
                <CardDescription>
                  Interactive visualization of department relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-card p-8 text-center">
                  <div className="mx-auto max-w-md">
                    <Network className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Department Hierarchy Visualization</h3>
                    <p className="text-muted-foreground mb-4">
                      This interactive chart shows the complete department structure with reporting lines.
                      Zoom in/out to explore different levels.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Badge variant="outline">Zoom: {zoom.toFixed(1)}x</Badge>
                      <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Structure Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Departments</span>
                    <Badge>12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Top-Level Departments</span>
                    <Badge variant="outline">4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maximum Depth</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Employees/Dept</span>
                    <Badge variant="default">24</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Department Tree</CardTitle>
                <CardDescription>
                  List view of department hierarchy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((level) => (
                    <div key={level} className="space-y-1">
                      <div className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">Department {level}</span>
                          <Badge variant="outline">Code: DEPT{level}</Badge>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <Badge>45 Employees</Badge>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                      {[1, 2].map((sub) => (
                        <div key={sub} className="ml-6 flex items-center gap-2 p-2 hover:bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3" />
                            <span>Sub-department {sub}</span>
                            <Badge variant="outline" className="text-xs">Code: SUB{sub}</Badge>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <Badge variant="secondary">12 Employees</Badge>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}