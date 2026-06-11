'use client';

import React, { useState } from 'react';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import { useRouter } from 'next/navigation';

function Settings() {
  const router = useRouter();
  const { userDetail, signOut, deleteAccount } = useUserDetail();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete this account permanently? This action cannot be undone.'
    );
    if (!confirmed) return;

    setError('');
    setDeleting(true);
    try {
      await deleteAccount();
      router.push('/sign-up');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-10">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your account for this local app instance.</p>

        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{userDetail?.name || '-'}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{userDetail?.email || '-'}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="font-medium capitalize">{userDetail?.role || 'user'}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Sign Out
        </button>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-3">Danger Zone</p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="rounded-lg border border-red-300 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Settings;
