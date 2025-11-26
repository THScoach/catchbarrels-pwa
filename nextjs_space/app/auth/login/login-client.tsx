'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        toast.error('Login failed', {
          description: 'Please check your credentials and try again.',
        });
      } else if (result?.ok) {
        toast.success('Welcome back!', {
          description: 'Redirecting to dashboard...',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Login failed', {
        description: 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username: string, password: string) => {
    setFormData({ username, password });
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Login failed');
        toast.error('Login failed');
      } else if (result?.ok) {
        toast.success('Welcome!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="text-[#F5A623]">BARRELS</span>
          </h1>
          <p className="text-gray-400 text-lg">Baseball Training & Analysis</p>
        </div>

        {/* Login Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#F5A623]" />
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username/Email */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Username or Email
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="john@doe.com"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={loading}
                  className="bg-gray-900/50 border-gray-600 text-white"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  className="bg-gray-900/50 border-gray-600 text-white"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F5A623] hover:bg-[#E89815] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/50 text-gray-400">or</span>
              </div>
            </div>

            {/* Whop OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => signIn('whop', { callbackUrl: '/dashboard' })}
              disabled={loading}
              className="w-full border-[#F5A623]/30 text-white hover:bg-[#F5A623]/10 hover:border-[#F5A623]"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
              Sign in with Whop
            </Button>

            {/* Quick Login (Dev Only) */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-500 mb-3">Quick login for testing:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('john@doe.com', 'johndoe123')}
                  disabled={loading}
                  className="text-xs border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  Test User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('admin@barrels.com', 'admin123')}
                  disabled={loading}
                  className="text-xs border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Secure login powered by Whop OAuth</p>
        </div>
      </div>
    </div>
  );
}
