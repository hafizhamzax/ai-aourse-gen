'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/_context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import { BRAND_LOGO_EMOJI, BRAND_NAME } from '@/lib/brand';

function userInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export default function Header2() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { userDetail, signOut } = useUserDetail();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className="flex justify-between items-center bg-card border-b border-border px-6 py-4 shadow-sm text-foreground transition-colors sticky top-0 z-40 backdrop-blur-sm bg-card/80">
      <div className="flex items-center space-x-3">
        <span className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-lg">
          {BRAND_LOGO_EMOJI}
        </span>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight hidden sm:block hover:text-primary transition-colors">
            {BRAND_NAME} <span className="text-muted-foreground font-normal">Workspace</span>
          </Link>
          {userDetail?.role === 'admin' && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Admin
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-transparent hover:border-border"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background">
          <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            {userInitials(userDetail?.name)}
          </div>
          <div className="text-xs">
            <p className="font-semibold leading-tight">{userDetail?.name || 'User'}</p>
            <p className="text-muted-foreground leading-tight">{userDetail?.email || ''}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
