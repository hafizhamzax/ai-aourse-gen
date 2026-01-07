'use client';

import React from 'react';
import SideBar from './_components/SideBar';
import Header2 from './_components/Header2';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <div className="flex flex-col flex-1 md:ml-0 md:pl-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card text-card-foreground shadow-sm border-b border-border">
          <div className="max-w-screen-xl mx-auto px-4 py-4">
            <Header2 />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-screen-xl mx-auto px-4 py-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
