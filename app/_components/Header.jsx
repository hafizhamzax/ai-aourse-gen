'use client';

import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/_context/ThemeContext';
import { BRAND_LOGO_EMOJI, BRAND_NAME } from '@/lib/brand';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-xl">
            {BRAND_LOGO_EMOJI}
          </span>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">
            {BRAND_NAME}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer border border-transparent hover:border-border"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 cursor-pointer hover:opacity-90 transition-all rounded-xl px-8 py-2.5"
            >
              Get Started
            </motion.button>
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-foreground focus:outline-none p-2"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 space-y-4 shadow-xl">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-muted-foreground"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>Toggle Theme</span>
            </button>
          </div>
          <Link href="/dashboard" className="block">
            <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 transition rounded-xl py-6 text-lg font-bold cursor-pointer">
              Get Started
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
