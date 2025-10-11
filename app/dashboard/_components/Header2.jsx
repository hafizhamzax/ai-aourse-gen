'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default function Header2() {
  return (
    <header className="flex justify-between items-center bg-indigo-700 px-6 py-3 shadow-md rounded-md text-white">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3">
       
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full border-2 border-white"
          priority
          
          />
          
          
<Link href="/dashboard" className="text-xl font-semibold tracking-wide hidden sm:block">
  Dashboard
</Link>
      </div>

      {/* User Profile Button */}
      <div>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            baseTheme: 'dark',
            elements: {
              userButtonAvatarBox: 'border-2 border-white',
            },
          }}
        />
      </div>
    </header>
  );
}
