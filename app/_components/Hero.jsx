'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.3, ease: 'easeOut' },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
   
    <section className="bg-gradient-to-br from-purple-50 via-white to-indigo-100 py-20 lg:py-32">
      {/* <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-300 to-yellow-300 py-8 px-4 sm:px-6 lg:px-8"> */}
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900"
            variants={itemVariants}
          >
            Instantly Build AI-Powered
            <motion.span
              className="text-indigo-600 block mt-2"
              variants={itemVariants}
            >
              Educational Courses
            </motion.span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-gray-700"
            variants={itemVariants}
          >
            Create complete course content in seconds using AI. Save time, boost quality,
            and revolutionize your teaching experience.
          </motion.p>

          <motion.div
            className="mt-8 flex justify-center gap-4 flex-wrap"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/dashboard" passHref>
                <button className="bg-indigo-600 hover:bg-indigo-800 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg transition duration-300 cursor-pointer">
                 Get Started
                </button>
              </Link>
            </motion.div>

            
          </motion.div>
        </motion.div>
      </div>
      {/* </div> */}
    </section>
  );
}
