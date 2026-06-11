'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, ease: 'easeOut', duration: 0.6 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero() {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="bg-background min-h-screen flex items-center justify-center pt-20 pb-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <motion.div
          className="max-w-4xl mx-auto flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
        >
          <motion.div variants={itemVariants}>
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-8 inline-block border border-primary/20 shadow-sm">
              🎓 Professional AI Course Studio
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight text-foreground tracking-tight mb-6"
            variants={itemVariants}
          >
            Build High-Quality <span className="text-primary">AI-Powered</span>
            <motion.span
              className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500 pb-2"
              variants={itemVariants}
            >
              Courses with {BRAND_NAME}
            </motion.span>
          </motion.h1>

          <motion.p
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            {BRAND_TAGLINE}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-6"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard"
                className="inline-flex bg-primary hover:opacity-90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-bold shadow-2xl shadow-primary/25 transition duration-300 cursor-pointer w-full sm:w-auto justify-center"
              >
                Start Building
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard/explore"
                className="inline-flex bg-secondary hover:bg-secondary/80 text-secondary-foreground px-8 py-4 rounded-xl text-lg font-bold transition duration-300 cursor-pointer w-full sm:w-auto justify-center border border-border"
              >
                Explore Courses
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
