'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, LogOut, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/use-auth';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

// Icon map with modern icons
const iconMap: Record<string, React.ComponentType<any>> = {
  // Dashboard
  home: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),

  // Profile
  user: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),

  // Employees
  users: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  // Loans - Money/Coins icon
  banknote: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),

  // Travel - Plane icon
  plane: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  ),

  // Overtime - Clock icon
  clock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),

  // Payroll
  'dollar-sign': () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),

  // Reports
  'bar-chart': () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),

  // Organization
  building: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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

  // Approvals
  'check-circle': () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),

  // Admin
  shield: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  ),

  // Help
  'help-circle': () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  ),

  'file-text': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),

  settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),

  workflow: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <rect width="8" height="8" x="13" y="3" rx="2" />
      <rect width="8" height="8" x="13" y="13" rx="2" />
      <rect width="8" height="8" x="3" y="13" rx="2" />
    </svg>
  ),

  list: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),

  history: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),

  plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

export function Sidebar({ onToggle }: { onToggle?: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const { 
    user, 
    logout, 
    getNavigationItems, 
    getOrganizationSubItems,
    canAccessWorkflowDefinitions,
    canAccessWorkflowApprovals 
  } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    organization: pathname.startsWith('/organization'),
    workflows: pathname.startsWith('/workflows'),
  });

  // Notify parent when collapsed state changes
  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  if (!user) {
    return null;
  }

  const navigationItems = getNavigationItems();
  
  // Get organization sub-items if user has access
  const organizationSubItems = getOrganizationSubItems();
  const hasOrganizationAccess = organizationSubItems.length > 0;

  // Get workflow sub-items based on permissions
  const workflowSubItems: { name: string; href: string; icon: string; }[] = [];
  
  if (canAccessWorkflowApprovals()) {
    workflowSubItems.push({
      name: 'Pending Approvals',
      href: '/workflows/approvals',
      icon: 'check-circle',
    });
  }
  
  if (canAccessWorkflowDefinitions()) {
    workflowSubItems.push({
      name: 'Definitions',
      href: '/workflows/configurations/definitions',
      icon: 'file-text',
    });
    workflowSubItems.push({
      name: 'Create Definition',
      href: '/workflows/configurations/definitions/create',
      icon: 'plus',
    });
  }
  
  // Always show these for users with workflow access
  workflowSubItems.push(
    {
      name: 'My Workflows',
      href: '/workflows/my-workflows',
      icon: 'history',
    },
    {
      name: 'Team Workflows',
      href: '/workflows/team-workflows',
      icon: 'users',
    }
  );

  const hasWorkflowAccess = workflowSubItems.length > 0;

  // Add settings and help items if not already included
  const secondaryItems = [
    ...(navigationItems.find((item) => item.name === 'Settings')
      ? []
      : [{ name: 'Settings', href: '/settings', icon: 'settings' }]),
    ...(navigationItems.find((item) => item.name === 'Help & Support')
      ? []
      : [{ name: 'Help & Support', href: '/help-support', icon: 'help-circle' }]),
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  // Check if item should be expanded by default
  const getDefaultExpanded = (itemName: string, baseHref: string) => {
    if (expandedItems[itemName] !== undefined) {
      return expandedItems[itemName];
    }
    return pathname.startsWith(baseHref);
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Sidebar Header - White background with logo */}
        <div
          className={cn(
            'h-20 bg-white border-b border-gray-200 flex items-center',
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          <div className={cn('flex items-center justify-center', collapsed ? 'w-full' : 'flex-1')}>
            <div className="relative h-10 w-full flex items-center justify-center">
              {collapsed ? (
                // Compact logo for collapsed state
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-50 rounded-xl"></div>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
                    <span className="text-xl font-bold text-requesta-primary">R</span>
                  </div>
                </div>
              ) : (
                // Full logo image for expanded state
                <div className="h-80 w-full flex items-center justify-center">
                  <Image
                    src="/images/logo2.png"
                    alt="Requesta Logo"
                    width={180}
                    height={80}
                    className="object-contain max-h-100"
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
              className="h-8 w-8 hover:bg-gray-100 rounded-lg"
              onClick={handleToggle}
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>

        {/* Main Sidebar Body */}
        <div className="flex-1 bg-gradient-to-br from-requesta-primary via-requesta-primary to-requesta-primary-dark border-r border-white/10 backdrop-blur-xl overflow-y-auto">
          {/* User Profile Section */}
          {/* {!collapsed && (
            <div className="px-4 py-4 border-b border-white/10">
              <div className="flex items-center space-x-3 rounded-xl bg-white/5 p-3 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-yellow-400/50 ring-2 ring-yellow-400/20">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-requesta-primary font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-requesta-primary bg-green-400 shadow-sm"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                  <p className="text-xs text-white/60 truncate">{user?.email}</p>
                </div>
                <Sparkles className="h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )} */}

          {/* Navigation */}
          <nav className="py-4 px-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = iconMap[item.icon] || iconMap['home'];
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const isOrganizationItem = item.name === 'Organization';
              const isWorkflowsItem = item.name === 'Workflows';
              
              // Get sub-items for each expandable item
              let subItems: Array<{ name: string; href: string; icon: string }> = [];
              let hasSubItems = false;
              
              if (isOrganizationItem && hasOrganizationAccess) {
                subItems = organizationSubItems.map(subItem => ({
                  ...subItem,
                  icon: subItem.icon || 'building'
                }));
                hasSubItems = true;
              }
              
              if (isWorkflowsItem && hasWorkflowAccess) {
                subItems = workflowSubItems;
                hasSubItems = true;
              }
              
              const isExpanded = !collapsed && getDefaultExpanded(item.name.toLowerCase(), item.href);

              return (
                <div key={item.name}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={cn(
                            'group relative flex items-center flex-1 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-white/10 text-white shadow-lg shadow-yellow-500/10'
                              : 'text-white/70 hover:bg-white/5 hover:text-white',
                            collapsed && 'justify-center'
                          )}
                        >
                          {/* Active indicator */}
                          {isActive && !collapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-gradient-to-b from-yellow-400 to-yellow-500"></div>
                          )}
                          
                          {/* Icon with gradient background on active */}
                          <div className={cn(
                            'flex items-center justify-center rounded-lg p-1.5 transition-all',
                            isActive ? 'bg-yellow-400/20' : 'group-hover:bg-white/5',
                            !collapsed && 'mr-3'
                          )}>
                            <Icon
                              className={cn(
                                'h-5 w-5 transition-all',
                                isActive ? 'text-yellow-400' : 'text-white/70 group-hover:text-white'
                              )}
                            />
                          </div>
                          
                          {!collapsed && (
                            <div className="flex items-center justify-between flex-1">
                              <span className="truncate">{item.name}</span>
                              {item.badge && (
                                <Badge className="ml-2 h-5 px-2 bg-yellow-400 text-requesta-primary text-xs font-bold border-0 shadow-sm">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Collapsed badge indicator */}
                          {collapsed && item.badge && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-requesta-primary">{item.badge}</span>
                            </div>
                          )}
                        </Link>
                        
                        {!collapsed && hasSubItems && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg ml-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleExpanded(item.name.toLowerCase());
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-gray-900 text-white border-white/20">
                        <p>{item.name}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>

                  {/* Sub-menu for expandable items */}
                  {hasSubItems && !collapsed && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1 border-l-2 border-yellow-500/20 pl-3">
                      {subItems.map((subItem) => {
                        const SubIcon = iconMap[subItem.icon] || iconMap['file-text'];
                        const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                        
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={cn(
                              'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              isSubActive
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                            )}
                          >
                            <SubIcon
                              className={cn(
                                'h-4 w-4 flex-shrink-0 mr-2',
                                isSubActive
                                  ? 'text-yellow-400'
                                  : 'text-yellow-500/70'
                              )}
                            />
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Divider */}
            {secondaryItems.length > 0 && (
              <div className="py-3">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            )}

            {/* Secondary Items */}
            {secondaryItems.map((item) => {
              const Icon = iconMap[item.icon] || iconMap['home'];
              const isActive = pathname === item.href;

              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'group relative flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-white/10 text-white shadow-lg'
                          : 'text-white/70 hover:bg-white/5 hover:text-white',
                        collapsed && 'justify-center'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center rounded-lg p-1.5 transition-all',
                        isActive ? 'bg-yellow-400/20' : 'group-hover:bg-white/5',
                        !collapsed && 'mr-3'
                      )}>
                        <Icon
                          className={cn(
                            'h-5 w-5 transition-all',
                            isActive ? 'text-yellow-400' : 'text-white/70 group-hover:text-white'
                          )}
                        />
                      </div>
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="bg-gray-900 text-white border-white/20">
                      <p>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Collapsed Sidebar Toggle Button */}
        {collapsed && (
          <div className="p-2 bg-requesta-primary border-t border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10 text-yellow-500 rounded-lg mx-auto"
              onClick={handleToggle}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-3 border-t border-white/10 bg-requesta-primary">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={logout}
                className={cn(
                  'w-full rounded-xl text-white/80 hover:text-white hover:bg-red-500/20 transition-all group',
                  collapsed ? 'justify-center px-0' : 'justify-start'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center rounded-lg p-1.5 group-hover:bg-red-500/10',
                  !collapsed && 'mr-3'
                )}>
                  <LogOut className="h-5 w-5 group-hover:text-red-400" />
                </div>
                {!collapsed && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-gray-900 text-white border-white/20">
                <p>Logout</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
