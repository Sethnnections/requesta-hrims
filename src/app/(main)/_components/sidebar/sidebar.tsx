'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/auth/use-auth'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

// Icon map with yellow icons
const iconMap: Record<string, React.ComponentType<any>> = {
  // Dashboard
  'home': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  
  // Profile
  'user': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  
  // Employees
  'users': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  
  // Loans - Money/Coins icon
  'banknote': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  
  // Travel - Plane icon
  'plane': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  ),
  
  // Overtime - Clock icon
  'clock': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  
  // Payroll - Credit card icon
  'dollar-sign': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  
  // Reports - Bar chart icon
  'bar-chart': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),
  
  // Organization - Building icon
  'building': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  ),
  
  // Approvals - Check circle icon
  'check-circle': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  
  // Admin - Shield icon
  'shield': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  ),
  
  // Help & Support - Help circle icon
  'help-circle': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  
  // Settings - Gear icon
  'settings': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  
  // Logout icon
  'log-out': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, getNavigationItems } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  
  if (!user) {
    return null
  }
  
  const navigationItems = getNavigationItems()
  
  // Add settings and help items if not already included
  const secondaryItems = [
    ...(navigationItems.find(item => item.name === 'Settings') ? [] : [
      { name: 'Settings', href: '/settings', icon: 'settings' }
    ]),
    ...(navigationItems.find(item => item.name === 'Help & Support') ? [] : [
      { name: 'Help & Support', href: '/help-support', icon: 'help-circle' }
    ])
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header - White background with full logo image */}
      <div className={cn(
        "h-16 bg-white border-b border-gray-200 flex items-center",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        <div className={cn(
          "flex items-center justify-center",
          collapsed ? "w-full" : "flex-1"
        )}>
          <div className="relative h-10 w-full flex items-center justify-center">
            {collapsed ? (
              // Compact logo for collapsed state
              <div className="h-8 w-8 flex items-center justify-center">
                <div className="h-6 w-6 bg-requesta-primary rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
              </div>
            ) : (
              // Full logo image for expanded state
              <div className="h-140 w-full flex items-center justify-center">
                <Image 
                  src="/images/logo2.png" 
                  alt="Requesta Logo" 
                  width={280} 
                  height={140}
                  className="object-contain max-h-140"
                  priority
                />
              </div>
            )}
          </div>
        </div>
        
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Sidebar Body - Primary Color */}
      <div className="flex-1 bg-requesta-primary overflow-y-auto">
        {/* Navigation Items */}
        <nav className="py-4">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.icon] || iconMap['home']
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-emerald-500/20 text-white' // Green shade for active
                      : 'text-white/90 hover:bg-white/10 hover:text-white',
                    collapsed && 'justify-center'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive 
                      ? 'text-yellow-500' // Yellow for active icons
                      : 'text-yellow-500/90 group-hover:text-yellow-400', // Yellow-500 for normal
                    !collapsed && 'mr-3'
                  )} />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge className="text-xs bg-yellow-500 text-gray-900 font-semibold">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 hidden rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover:block z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Divider - Only show if there are secondary items */}
          {secondaryItems.length > 0 && (
            <>
              <div className="my-4 px-3">
                <div className="h-px bg-white/20"></div>
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-1 px-2">
                {secondaryItems.map((item) => {
                  const Icon = iconMap[item.icon] || iconMap['home']
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors relative',
                        isActive
                          ? 'bg-emerald-500/20 text-white' // Green shade for active
                          : 'text-white/90 hover:bg-white/10 hover:text-white',
                        collapsed && 'justify-center'
                      )}
                    >
                      <Icon className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive 
                          ? 'text-yellow-500' // Yellow for active icons
                          : 'text-yellow-500/90 group-hover:text-yellow-400', // Yellow-500 for normal
                        !collapsed && 'mr-3'
                      )} />
                      {!collapsed && <span>{item.name}</span>}
                      {collapsed && (
                        <div className="absolute left-full ml-2 hidden rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover:block z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Collapsed Sidebar Toggle Button */}
      {collapsed && (
        <div className="p-2 bg-requesta-primary border-t border-requesta-primary-light">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/10 text-yellow-500"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Logout Button */}
      <div className="bg-requesta-primary border-t border-requesta-primary-light p-4">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-white hover:bg-white/10',
            collapsed && 'justify-center'
          )}
          onClick={logout}
        >
          <div className={cn(
            'flex items-center',
            collapsed ? 'justify-center' : 'space-x-3'
          )}>
            <div className="h-5 w-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            {!collapsed && <span>Logout</span>}
          </div>
        </Button>
      </div>
    </aside>
  )
}