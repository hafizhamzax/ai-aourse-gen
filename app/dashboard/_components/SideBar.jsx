import React, { useState, useEffect } from 'react';
import { IoMdHome, IoMdSettings } from 'react-icons/io';
import { GrProjects } from 'react-icons/gr';
import {
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
} from 'react-icons/ai';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import { BRAND_LOGO_EMOJI, BRAND_NAME } from '@/lib/brand';

export default function SideBar() {
  const router = useRouter();
  const { signOut } = useUserDetail();
  const menu = [
    { id: 1, name: 'Home', icon: <IoMdHome />, path: '/dashboard' },
    { id: 2, name: 'Explore', icon: <GrProjects />, path: '/dashboard/explore' },
    { id: 3, name: 'Settings', icon: <IoMdSettings />, path: '/dashboard/settings' },
  ];

  const path = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [path]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar-primary text-sidebar-primary-foreground md:hidden focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open sidebar menu"
      >
        <AiOutlineMenu size={24} />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          bg-sidebar text-sidebar-foreground shadow-lg border-r border-sidebar-border
          flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div
            className={`flex items-center justify-between px-6 py-6 border-b border-sidebar-border ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'hidden' : 'opacity-100'}`}>
              <div className="h-11 w-11 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-xl">
                {BRAND_LOGO_EMOJI}
              </div>
              <Link href="/">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500 truncate">
                  {BRAND_NAME}
                </span>
              </Link>
            </div>

            {isCollapsed && (
              <div className="h-11 w-11 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-xl">
                {BRAND_LOGO_EMOJI}
              </div>
            )}

            {!isMobileOpen && (
              <button
                className={`hidden md:inline-flex p-1.5 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring hover:bg-sidebar-accent transition-colors ${isCollapsed ? 'absolute -right-3 top-8 bg-sidebar border border-sidebar-border shadow-md rounded-full' : ''}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <AiOutlineDoubleRight size={16} /> : <AiOutlineDoubleLeft size={20} />}
              </button>
            )}

            <button
              className="md:hidden p-1 rounded-md text-sidebar-foreground hover:text-sidebar-foreground/70 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close sidebar menu"
            >
              <AiOutlineClose size={28} />
            </button>
          </div>

          <nav className="flex-1 mt-6 px-4 space-y-2">
            {menu.map((item) => {
              const isActive = item.path === path;
              return (
                <div key={item.id}>
                  <Link
                    href={item.path}
                    className={`
                      flex items-center gap-4 rounded-xl px-4 py-3.5 cursor-pointer font-medium
                      transition-all duration-200 group
                      ${isActive
                        ? 'bg-sidebar-primary shadow-lg shadow-sidebar-primary/20 text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:pl-5'}
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`text-2xl flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                    {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>
                </div>
              );
            })}

            <button
              onClick={handleSignOut}
              className={`w-full 
                flex items-center gap-4 rounded-xl px-4 py-3.5 cursor-pointer font-medium
                transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:pl-5
                ${isCollapsed ? 'justify-center px-2' : ''}
              `}
            >
              <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <AiOutlineLogout />
              </span>
              {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
            </button>
          </nav>
        </div>

      </aside>
    </>
  );
}
