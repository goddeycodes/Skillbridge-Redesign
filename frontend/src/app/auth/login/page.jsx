'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Logo from '../../../components/shared/Logo';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.replace(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) return null;

  const oauthUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/auth/google`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center">
            <Logo />
          </div>
          <h1 className="font-display mt-6 text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue learning and teaching</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {/* OAuth error banner */}
          {searchParams.get('error') === 'oauth_failed' && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              <AlertCircle size={15} /> Google sign-in failed. Please try again.
            </div>
          )}

          {/* Google OAuth */}
          <a href={oauthUrl}
            className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.88v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.52V5.41H1.88A8 8 0 0 0 .98 9c0 1.29.31 2.51.9 3.59l2.63-2.07z"/>
              <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .9 5.41L3.53 7.48C4.16 5.6 5.9 3.58 8.98 3.58z"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-slate-400">or sign in with email</span></div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="sb-label">Email address</label>
              <input {...register('email')} type="email" className="sb-input" placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="sb-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="sb-label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'}
                  className="sb-input pr-10" placeholder="Your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="sb-error">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="sb-btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={15} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}