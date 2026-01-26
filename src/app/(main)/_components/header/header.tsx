'use client'

import { useState } from 'react'
import { Bell, Search, Menu, X, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/slices/auth-slice'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Header() {
  const { user } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications] = useState([
    { id: 1, text: 'New loan application pending approval', time: '5 min ago', unread: true },
    { id: 2, text: 'Travel request approved', time: '1 hour ago', unread: true },
    { id: 3, text: 'Overtime claim submitted', time: '2 hours ago', unread: false },
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section - Mobile menu and search */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button (hidden on lg) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search employees, requests..."
              className="pl-9 w-[300px] focus:border-requesta-primary focus:ring-requesta-primary"
            />
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-4">
          {/* Help */}
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-requesta-accent text-xs font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-requesta-primary/20">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="requesta">New</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      'cursor-pointer flex-col items-start p-3',
                      notification.unread && 'bg-requesta-background/50'
                    )}
                  >
                    <div className="flex items-start justify-between w-full">
                      <p className="text-sm">{notification.text}</p>
                      {notification.unread && (
                        <span className="h-2 w-2 rounded-full bg-requesta-accent"></span>
                      )}
                    </div>
                    <span className="mt-1 text-xs text-gray-500">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-center justify-center text-requesta-primary hover:text-requesta-primary-light">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9 border-2 border-requesta-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-requesta-primary text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-requesta-primary/20">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-gray-600">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>Switch Organization</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search (hidden on md and up) */}
      <div className="border-t border-gray-100 px-4 py-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 w-full focus:border-requesta-primary focus:ring-requesta-primary"
          />
        </div>
      </div>
    </header>
  )
}