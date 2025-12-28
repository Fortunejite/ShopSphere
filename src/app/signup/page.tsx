'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { createUserSchema } from '@/lib/schema/auth';
import { z } from 'zod';
import axios from 'axios';

export default function SignupPage() {
  const { status } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone_number: '',
    address: '',
    city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/shops';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (authError) {
      setAuthError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    setSuccess(false);

    try {
      // Validate form data
      const validatedData = createUserSchema.parse(formData);
      
      const response = await axios.post('/api/auth/register', validatedData);

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (errorData?.error === 'EmailAlreadyExist') {
          setAuthError('Email already exists. Please use a different email or sign in.');
        } else {
          setAuthError(errorData?.message || 'Registration failed. Please try again.');
        }
      } else {
        setAuthError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'authenticated') {
    router.push(next);
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">Account Created!</h2>
                <p className="text-neutral-600">
                  Your account has been created successfully. You&apos;ll be redirected to the home page shortly.
                </p>
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src="/authPic.png"
                alt="ShopSphere"
                width={64}
                height={64}
                className="rounded-2xl"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Join ShopSphere</h1>
          <p className="text-neutral-600">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Auth Error Alert */}
              {authError && (
                <Alert variant="destructive">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={errors.username ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className={errors.phone_number ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500">{errors.phone_number}</p>
                )}
              </div>

              {/* City Field */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Enter your city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={isLoading}
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              {/* Create Account Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Divider */}
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>
                  Sign In
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500 space-y-2">
          <p>
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}