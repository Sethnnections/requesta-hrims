'use client'

import { Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Employee Directory', href: '/employees/directory' },
    { name: 'Loan Applications', href: '/loans/applications' },
    { name: 'Travel Requests', href: '/travel/requests' },
    { name: 'Payroll', href: '/payroll/payslips' },
    { name: 'Reports', href: '/reports' },
  ]

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Documentation', href: '/docs' },
  ]

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
    { name: 'GitHub', icon: Github, href: 'https://github.com' },
  ]

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-requesta-primary">
                <span className="text-2xl font-bold text-white">R</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Requesta HRIMS</h3>
                <p className="text-sm text-gray-600">Human Resource Information Management System</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Streamlining HR processes with modern, efficient, and secure solutions for your organization.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-requesta-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-requesta-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-requesta-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Stay Updated</h4>
              <p className="text-sm text-gray-600 mb-3">
                Subscribe to our newsletter for the latest updates.
              </p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 focus:border-requesta-primary focus:ring-requesta-primary"
                />
                <Button variant="requesta">Subscribe</Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-requesta-primary" />
                  <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-requesta-primary" />
                  <span className="text-sm text-gray-600">support@requesta.com</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-requesta-primary mt-0.5" />
                  <span className="text-sm text-gray-600">
                    123 Business Street<br />
                    Suite 100<br />
                    New York, NY 10001
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} Requesta HRIMS. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-requesta-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-requesta-primary">
                Terms of Service
              </Link>
              <Link href="/security" className="text-sm text-gray-600 hover:text-requesta-primary">
                Security
              </Link>
              <Link href="/sitemap" className="text-sm text-gray-600 hover:text-requesta-primary">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}