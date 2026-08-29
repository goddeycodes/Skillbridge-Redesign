'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Logo from '../../../components/shared/Logo';
import { getGoogleOAuthUrl } from '../../../lib/backendUrl';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  terms:    z.boolean().refine(v => v === true, 'You must accept the terms'),
});

function PasswordStrength({ password = '' }) {
  const checks = [
    { label: '8+ characters',   pass: password.length >= 8      },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password)   },
    { label: 'Number',           pass: /[0-9]/.test(password)   },
  ];
  const score = checks.filter(c => c.pass).length;
  const bar   = ['bg-red-400', 'bg-gold-400', 'bg-success-500'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? bar[score - 1] : 'bg-slate-100'}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? 'text-success-600' : 'text-slate-400'}`}>
            <span>{c.pass ? '✓' : '○'}</span> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { user, loading: authLoading, register: registerUser } = useAuth();
  const router = useRouter();
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', terms: false },
  });

  const password = watch('password', '');

  const onSubmit = async ({ name, email, password }) => {
    setLoading(true);
    setError('');
    try {
      await registerUser(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Could not create account. Please try again.');
      } else {
        setError("Can't reach the server. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) return null;

  const oauthUrl = getGoogleOAuthUrl();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center">
            <Logo />
          </div>
          <h1 className="font-display mt-6 text-2xl font-bold text-slate-800">Create your account</h1>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 border border-gold-100 text-gold-700 text-xs font-medium">
            <Zap size={11} /> You&apos;ll get 10 free credits to start
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

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
            <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-slate-400">or create account with email</span></div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="sb-label">Full name</label>
              <input {...register('name')} className="sb-input" placeholder="Kwaku Mensah" autoComplete="name" />
              {errors.name && <p className="sb-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="sb-label">Email address</label>
              <input {...register('email')} type="email" className="sb-input" placeholder="you@example.com" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck="false" />
              {errors.email && <p className="sb-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="sb-label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'}
                  className="sb-input pr-10" placeholder="Create a strong password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="sb-error">{errors.password.message}</p>}
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input {...register('terms')} type="checkbox" id="terms"
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-brand-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="sb-error -mt-2">{errors.terms.message}</p>}

            <button type="submit" disabled={loading} className="sb-btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={15} className="animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}