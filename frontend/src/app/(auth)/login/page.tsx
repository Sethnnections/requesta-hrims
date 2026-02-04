'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/auth/use-auth';
import { useAuthStore } from '@/store/slices/auth-slice';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { user, isAuthenticated } = useAuthStore(); // Get auth state
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: 'ceo@sethnnections.mw', // Pre-fill for testing
    password: 'CEO123!', // Pre-fill for testing
  });
  const [error, setError] = useState('');

  // Debug: Check current auth state
  console.log('Login Page - Auth State:', {
    user,
    isAuthenticated,
    isLoading,
  });

  // app/(auth)/login/page.tsx - Updated handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Login attempt with:', {
      identifier: formData.identifier,
      password: formData.password,
    });

    try {
      const result = await login(formData.identifier, formData.password);
      console.log('Login successful! Response:', result);

      // Wait for state to update
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Force hard redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-requesta-background to-white p-4">
      <Card className="w-full max-w-md shadow-requesta-lg border-requesta-primary/20">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            {/* Fixed logo */}
              <div className="h-240 w-full flex items-center justify-center">
                <Image
                  src="/images/logo2.png"
                  alt="Requesta Logo"
                  width={280}
                  height={240}
                  className="object-contain max-h-140"
                  priority
                />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Travel request and Loan applications Simplified
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                Email or Username
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="ceo@sethnnections.mw"
                  className="pl-10"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-requesta-secondary hover:text-requesta-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-requesta-primary hover:bg-requesta-primary-light"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">Demo Credentials</p>
            <div className="mt-2 space-y-1 font-mono text-xs bg-gray-50 p-3 rounded-md">
              <p>Email: ceo@sethnnections.mw</p>
              <p>Password: CEO123!</p>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Need help? </span>
            <Link
              href="/contact"
              className="font-medium text-requesta-secondary hover:text-requesta-primary hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
