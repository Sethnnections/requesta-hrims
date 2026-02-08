'use client'

import { useState } from 'react'
import { Bell, Search, Menu, X, Settings, LogOut, User, Building2, Zap, Command } from 'lucide-react'
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
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifications] = useState([
    { id: 1, text: 'New loan application pending approval', time: '5 min ago', unread: true, type: 'loan' },
    { id: 2, text: 'Travel request approved', time: '1 hour ago', unread: true, type: 'success' },
    { id: 3, text: 'Overtime claim submitted', time: '2 hours ago', unread: false, type: 'info' },
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'loan': return '💰';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* Left section - Mobile menu and search */}
        <div className="flex items-center flex-1 space-x-4 min-w-0">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-requesta-primary/10 rounded-xl transition-all flex-shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-requesta-primary" />
            ) : (
              <Menu className="h-5 w-5 text-requesta-primary" />
            )}
          </Button>

          {/* Enhanced Search */}
          <div className="relative hidden md:block flex-1 max-w-2xl">
            <div className={cn(
              "relative transition-all duration-200",
              searchFocused && "transform scale-[1.02]"
            )}>
              <div className="absolute inset-0 bg-gradient-to-r from-requesta-primary/20 to-yellow-400/20 rounded-xl blur-sm opacity-0 transition-opacity duration-200"
                style={{ opacity: searchFocused ? 1 : 0 }}
              ></div>
              <div className="relative flex items-center">
                <Search className={cn(
                  "absolute left-3 h-4 w-4 transition-colors",
                  searchFocused ? "text-requesta-primary" : "text-gray-400"
                )} />
                <Input
                  type="search"
                  placeholder="Search anything... (Ctrl+K)"
                  className={cn(
                    "pl-10 pr-12 h-10 w-full rounded-xl border-gray-200 bg-gray-50/50 transition-all",
                    "focus:border-requesta-primary focus:ring-requesta-primary/20 focus:bg-white",
                    "placeholder:text-gray-400"
                  )}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <div className="absolute right-3 flex items-center gap-1">
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-600">
                    <Command className="h-3 w-3" />K
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Quick Action Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:inline-flex rounded-xl hover:bg-requesta-primary/10 relative group"
          >
            <Zap className="h-5 w-5 text-requesta-primary group-hover:text-yellow-500 transition-colors" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
          </Button>

          {/* Theme Switcher */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>

          {/* Notifications with modern dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-xl hover:bg-requesta-primary/10 transition-all group"
              >
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-requesta-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-requesta-accent opacity-75"></span>
                    <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-requesta-accent text-[10px] font-bold text-white shadow-lg">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0 border-gray-200/50 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread messages</p>
                </div>
                <Badge className="bg-gradient-to-r from-requesta-primary to-yellow-500 text-white border-0 shadow-sm">
                  New
                </Badge>
              </div>
              
              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <DropdownMenuItem
                      className={cn(
                        'cursor-pointer p-4 focus:bg-gray-50 transition-colors',
                        notification.unread && 'bg-requesta-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-3 w-full">
                        {/* Icon */}
                        <div className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                          notification.unread 
                            ? "bg-gradient-to-br from-requesta-primary/20 to-yellow-400/20" 
                            : "bg-gray-100"
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm leading-snug",
                            notification.unread ? "font-medium text-gray-900" : "text-gray-600"
                          )}>
                            {notification.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{notification.time}</span>
                            {notification.unread && (
                              <span className="h-1.5 w-1.5 rounded-full bg-requesta-accent"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    {index < notifications.length - 1 && (
                      <div className="h-px bg-gray-100 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-requesta-primary hover:text-requesta-primary hover:bg-requesta-primary/10 font-medium text-sm rounded-lg"
                >
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile with modern dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 gap-2 rounded-xl px-2 hover:bg-requesta-primary/10 transition-all group"
              >
                <Avatar className="h-8 w-8 border-2 border-transparent group-hover:border-requesta-primary/30 transition-all">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-requesta-primary to-yellow-500 text-white text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm"></span>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user?.username}</p>
                  <p className="text-xs text-gray-500 leading-none mt-0.5">Online</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-0 border-gray-200/50 shadow-xl">
              {/* Profile Header */}
              <div className="p-4 bg-gradient-to-br from-requesta-primary to-yellow-500">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-white/50 ring-2 ring-white/20">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-white text-requesta-primary font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                    <p className="text-xs text-white/80 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-gray-50">
                  <User className="mr-3 h-4 w-4 text-requesta-primary" />
                  <span className="font-medium">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-gray-50">
                  <Settings className="mr-3 h-4 w-4 text-requesta-primary" />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-gray-50">
                  <Building2 className="mr-3 h-4 w-4 text-requesta-primary" />
                  <span className="font-medium">Switch Organization</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="my-1" />

              <div className="p-2">
                <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-red-50 text-red-600 focus:text-red-600">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-gray-100 px-4 py-3 md:hidden bg-gray-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 w-full rounded-xl border-gray-200 bg-white focus:border-requesta-primary focus:ring-requesta-primary/20"
          />
        </div>
      </div>
    </header>
  )
}
