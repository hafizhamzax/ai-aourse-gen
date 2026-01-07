'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import Link from 'next/link';

function AddCourse() {
  const { user } = useUser();
  const { userDetail } = useUserDetail();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-card shadow-md border border-border rounded-lg p-6 space-y-4 sm:space-y-0 sm:space-x-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          Welcome To,{' '}
          <span className="font-extrabold text-primary">{user?.fullName ?? 'User'}</span>
          {userDetail?.role === 'admin' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm animate-in fade-in zoom-in duration-500">
              Admin
            </span>
          )}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          {userDetail?.role === 'admin'
            ? 'Ready to share your knowledge? Create a new course now!'
            : 'Explore our library of courses and start learning today!'}
        </p>
      </div>

      {userDetail?.role === 'admin' && (
        <Link href="/create-course" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer">
            + Create Course
          </Button>
        </Link>
      )}
    </div>
  );
}

export default AddCourse;
