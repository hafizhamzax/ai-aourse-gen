'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useTheme } from '@/app/_context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

import { useUserDetail } from '@/app/_context/UserDetailContext';

export default function Header2() {
  const { theme, toggleTheme } = useTheme();
  const { userDetail } = useUserDetail();

  return (
    <header className="flex justify-between items-center bg-card border border-border px-6 py-3 shadow-sm rounded-md text-foreground transition-colors">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3">

        <Image
          src="/logo.jpg"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full border border-border"
          priority

        />


        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xl font-semibold tracking-wide hidden sm:block hover:text-primary transition-colors">
            Dashboard
          </Link>
          {userDetail?.role === 'admin' && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Admin Mode
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-transparent hover:border-border"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              baseTheme: theme === 'dark' ? 'dark' : 'light',
              elements: {
                userButtonAvatarBox: userDetail?.role === 'admin'
                  ? 'border-2 border-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'
                  : 'border-2 border-white',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
