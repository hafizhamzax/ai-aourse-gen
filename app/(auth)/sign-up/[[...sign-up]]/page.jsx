'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND_LOGO_EMOJI, BRAND_NAME } from '@/lib/brand';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import axios from 'axios';

export default function Page() {
  const router = useRouter();
  const { signUp } = useUserDetail();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminSignupEnabled, setAdminSignupEnabled] = useState(false);
  const [adminStatusLoading, setAdminStatusLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadAdminStatus = async () => {
      try {
        const response = await axios.get('/api/auth/admin-status');
        if (!mounted) return;
        setAdminSignupEnabled(Boolean(response.data?.adminSignupEnabled));
      } catch (err) {
        if (!mounted) return;
        setAdminSignupEnabled(false);
      } finally {
        if (mounted) setAdminStatusLoading(false);
      }
    };

    loadAdminStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp({
        name,
        email,
        password,
        adminPassword: adminSignupEnabled ? adminPassword : '',
      });
      router.replace('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Sign up failed.');
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

        <h1 className="text-2xl font-bold text-center mb-1">Create Account</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Simple sign up and sign in</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Full Name"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            minLength={6}
            placeholder="Password (min 6 chars)"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {adminSignupEnabled && (
            <div className="space-y-2 border-t border-border/50 pt-4 mt-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Special Admin Access (Optional)
              </label>
              <input
                type="password"
                placeholder="Enter special admin key"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />

              <p className="text-[10px] leading-tight text-muted-foreground">
                Enter the secret key to create the primary admin account. 
                If you don't know it, leave it blank to sign up as a normal user.
                <br/>
                <span className="text-primary/70 mt-1 block italic">This option will disappear once the first admin is created.</span>
              </p>
            </div>
          )}



          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
