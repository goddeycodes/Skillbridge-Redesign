'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');

    if (err || !token) {
      setError('Google sign-in failed.');
      setTimeout(() => router.replace('/auth/login'), 2500);
      return;
    }

    localStorage.setItem('sb_token', token);

    refreshUser()
      .then(() => router.replace('/dashboard'))
      .catch(() => {
        setError('Could not load account.');
      });
  }, [router, searchParams, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <XCircle />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" />
      <p>Signing you in...</p>
    </div>
  );
}

export default function CallbackWrapper() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackPage />
    </Suspense>
  );
}