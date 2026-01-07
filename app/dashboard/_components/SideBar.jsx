'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoMdHome } from 'react-icons/io';
import { GrProjects } from 'react-icons/gr';
import { GoShieldCheck } from 'react-icons/go';
import {
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
} from 'react-icons/ai';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

export default function SideBar() {
  const Menu = [
    { id: 1, name: 'Home', icon: <IoMdHome />, path: '/dashboard' },
    { id: 2, name: 'Explore', icon: <GrProjects />, path: '/dashboard/explore' },
    { id: 3, name: 'Upgrade', icon: <GoShieldCheck />, path: '/dashboard/Upgrade' },
    // { id: 4, name: 'Logout', icon: <AiOutlineLogout />, path: '/dashboard/logout' },
  ];

  const path = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [path]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar-primary text-sidebar-primary-foreground md:hidden focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open sidebar menu"
      >
        <AiOutlineMenu size={24} />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed inset-y-0 left-0 z-50
    bg-sidebar text-sidebar-foreground shadow-lg
    flex flex-col justify-between
    transition-all duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    md:static md:translate-x-0
    ${isCollapsed ? 'w-20' : 'w-64'}
  `}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-5 border-b border-sidebar-border ${isCollapsed ? 'justify-center' : ''
            }`}
        >
          <div className='flex items-center gap-2'>

            <Image
              src="/logo.jpg"
              alt="Logo"
              width={40}
              height={40}
              className={`rounded-full transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-10'
                }`}
              priority
            />
            <Link href={'/'}>
            {!isCollapsed && (
              <span className="text-xl hidden sm:inline transition-all duration-300">
                Learnify
              </span>
            )}
            </Link>
          </div>
          {/* Desktop collapse toggle */}
          <button
            className="hidden md:inline-flex p-1 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <AiOutlineDoubleRight size={24} />
            ) : (
              <AiOutlineDoubleLeft size={24} />
            )}
          </button>

          {/* Mobile close button */}
          <button
            className="md:hidden p-1 rounded-md text-sidebar-foreground hover:text-sidebar-foreground/70 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar menu"
          >
            <AiOutlineClose size={28} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="mt-6 space-y-1 px-1">
            {Menu.map((item) => {
              const isActive = item.path === path;
              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={`
                      flex items-center gap-4 rounded-md px-3 py-3 cursor-pointer
                      transition-colors duration-200
                      ${isActive
                        ? 'bg-sidebar-primary shadow-md text-sidebar-primary-foreground font-semibold'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>


      </aside>
    </>
  );
}
