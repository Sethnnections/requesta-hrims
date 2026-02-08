'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

// Map of paths to custom labels
const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  profile: 'My Profile',
  employees: 'Employees',
  directory: 'Directory',
  loans: 'Loans',
  applications: 'Applications',
  travel: 'Travel',
  requests: 'Requests',
  overtime: 'Overtime',
  payroll: 'Payroll',
  payslips: 'Payslips',
  reports: 'Reports',
  organization: 'Organization',
  departments: 'Departments',
  positions: 'Positions',
  branches: 'Branches',
  'job-grades': 'Job Grades',
  approvals: 'Approvals',
  workflows: 'Workflows',
  'my-workflows': 'My Workflows',
  'team-workflows': 'Team Workflows',
  configurations: 'Configurations',
  definitions: 'Definitions',
  create: 'Create',
  admin: 'Admin',
  settings: 'Settings',
  'help-support': 'Help & Support',
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    
    const breadcrumbs = [
      { label: 'Home', href: '/dashboard', isHome: true }
    ]

    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // Use custom label if available, otherwise format the path
      const label = pathLabels[path] || path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isHome: false
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on dashboard page
  if (pathname === '/dashboard') {
    return null
  }

  return (
    <nav 
      className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-200" 
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <li key={breadcrumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1.5" />
              )}
              
              {isLast ? (
                <span className="flex items-center font-semibold text-requesta-primary bg-requesta-primary/5 px-3 py-1.5 rounded-lg">
                  {breadcrumb.isHome && <Home className="h-4 w-4 mr-2" />}
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className={cn(
                    "flex items-center text-gray-600 hover:text-requesta-primary transition-all",
                    "px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium"
                  )}
                >
                  {breadcrumb.isHome && <Home className="h-4 w-4 mr-2" />}
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
