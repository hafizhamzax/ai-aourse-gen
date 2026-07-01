'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { BRAND_LOGO_EMOJI, BRAND_NAME } from '@/lib/brand';
import { useUserDetail } from '@/app/_context/UserDetailContext';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const { signIn } = useUserDetail();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn({ email, password });
      router.refresh();
      router.replace(nextPath);
    } catch (err) {
      setError(err?.response?.data?.error || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-8">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3">
          <span className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl">{BRAND_LOGO_EMOJI}</span>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">{BRAND_NAME}</span>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-1">Sign In</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Access your workspace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
