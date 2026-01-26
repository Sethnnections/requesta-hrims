// app/(main)/_components/sidebar/sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Briefcase,
  FileText,
  BarChart,
  Banknote,
  Plane,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building,
  HelpCircle,
  Shield,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/slices/auth-slice'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Employees', href: '/employees/directory', icon: Users },
  { name: 'Organization', href: '/organization/structure', icon: Building },
  { name: 'Loans', href: '/loans/applications', icon: Banknote },
  { name: 'Travel', href: '/travel/requests', icon: Plane },
  { name: 'Overtime', href: '/overtime/claims', icon: Clock },
  { name: 'Payroll', href: '/payroll/payslips', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart },
  { name: 'Workflows', href: '/workflows/approvals', icon: Briefcase },
]

const secondaryItems = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
  { name: 'Admin', href: '/admin/dashboard', icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-requesta-primary/20 bg-requesta-primary px-4">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'space-x-3')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <span className="text-2xl font-bold text-requesta-primary">R</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">Requesta</h1>
              <p className="text-xs text-requesta-background/80">HRIMS</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-requesta-primary-light"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Profile */}
      <div className={cn(
        'border-b border-requesta-primary/20 bg-requesta-primary-light p-4',
        collapsed && 'flex flex-col items-center'
      )}>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'space-x-3')}>
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-requesta-accent text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">{user?.username}</p>
              <p className="truncate text-xs text-requesta-background/80">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto bg-white py-4">
        <div className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-requesta-background text-requesta-primary'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-requesta-primary',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-requesta-primary' : 'text-gray-400 group-hover:text-requesta-primary',
                  !collapsed && 'mr-3'
                )} />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 hidden rounded-md bg-requesta-primary px-2 py-1 text-xs text-white group-hover:block">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-6 px-3">
          <div className="h-px bg-gray-200"></div>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1 px-3">
          {secondaryItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-requesta-background text-requesta-primary'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-requesta-primary',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-requesta-primary' : 'text-gray-400 group-hover:text-requesta-primary',
                  !collapsed && 'mr-3'
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600',
            collapsed && 'justify-center'
          )}
          onClick={() => {  }}
        >
          <LogOut className={cn('h-5 w-5', !collapsed && 'mr-3')} />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </aside>
  )
}