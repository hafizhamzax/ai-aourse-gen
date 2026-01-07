'use client';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/_context/ThemeContext';
function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-700 dark:to-indigo-800 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2">
          <Image src="/logo.jpg" width={40} height={40} alt="Logo" className="rounded-full" />
          <span className="text-xl font-bold hidden sm:inline">Learnify</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <Link href="/dashboard">
  <motion.button
    whileHover={{ scale: 1.05,  }}
    whileTap={{ scale: 0.95 }}
    className="bg-primary text-primary-foreground font-semibold shadow-lg cursor-pointer hover:opacity-90 transition-all rounded-full px-6 py-2"
  >
    Sign Up/In
  </motion.button>
</Link>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white focus:outline-none">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card text-card-foreground px-4 py-4 space-y-4">
         
          <Link href="/dashboard">
            <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 transition rounded-full cursor-pointer">
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
