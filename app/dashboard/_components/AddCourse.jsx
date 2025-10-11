'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

function AddCourse() {
  const { user } = useUser();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white shadow-md rounded-lg p-6 space-y-4 sm:space-y-0 sm:space-x-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome To,{' '}
          <span className="font-extrabold text-indigo-600">{user?.fullName ?? 'User'}</span>
        </h2>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Ready to share your knowledge? Create a new course now!
        </p>
      </div>

      <Link href="/create-course" passHref>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer">
          + Create Course
        </Button>
      </Link>
    </div>
  );
}

export default AddCourse;
