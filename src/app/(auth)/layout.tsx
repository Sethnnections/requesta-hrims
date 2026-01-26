import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Requesta HRIMS',
  description: 'Sign in to access the Human Resource Information Management System',
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-requesta-background via-white to-gray-50">
      {children}
    </div>
  )
}