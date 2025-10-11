'use client';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2">
          <Image src="/logo.jpg" width={40} height={40} alt="Logo" className="rounded-full" />
          <span className="text-xl font-bold hidden sm:inline">Learnify</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          
          <Link href="/dashboard">
  <motion.button
    whileHover={{ scale: 1.05,  }}
    whileTap={{ scale: 0.95 }}
    className="bg-white text-purple-700 font-semibold shadow-lg cursor-pointer hover:bg-purple-50 transition-all  rounded-full px-6 py-2"
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
        <div className="md:hidden bg-white text-purple-800 px-4 py-4 space-y-4">
         
          <Link href="/dashboard">
            <Button className="w-full bg-purple-600 text-white hover:bg-purple-700 transition rounded-full">
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
