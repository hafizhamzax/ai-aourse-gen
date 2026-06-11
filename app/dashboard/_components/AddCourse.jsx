'use client';

import { Button } from '@/components/ui/button';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import Link from 'next/link';

function AddCourse() {
  const { userDetail } = useUserDetail();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-card shadow-md border border-border rounded-lg p-6 space-y-4 sm:space-y-0 sm:space-x-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
          Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">{userDetail?.name ?? 'Instructor'}</span>
          <span className="text-2xl">👋</span>
        </h2>
        <p className="text-muted-foreground text-md max-w-xl leading-relaxed">
          {userDetail?.role === 'admin'
            ? 'Ready to generate comprehensive curriculums? Brief the AI directly with your topic and requirements to get started.'
            : 'Access your assigned material and track your learning progress.'}
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
