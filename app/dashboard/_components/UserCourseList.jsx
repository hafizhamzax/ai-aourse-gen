"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import CourseCard from './CourseCard';
import { BrainCircuit } from 'lucide-react';

function UserCourseList() {
    const { userDetail } = useUserDetail();
    const [courseList, setCourseList] = useState([]);
    const [totalCourseCount, setTotalCourseCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const isAdmin = userDetail?.role === 'admin';

    const getUserCourses = useCallback(async () => {
        setLoading(true);
        try {
            // Note: In a real app, you'd filter via API parameters. 
            // For now, based on get-course API, we fetch all and filter client side.
            const resp = await fetch('/api/get-course');
            const data = await resp.json();

            if (data?.courses) {
                const filteredCourses = data.courses
                    .filter((course) => {
                        if (!course?.isPublished) return false;
                        if (isAdmin) return course?.createdBy === userDetail?.email;
                        return true;
                    })
                    .sort((a, b) => (b?.id || 0) - (a?.id || 0));

                setTotalCourseCount(filteredCourses.length);
                setCourseList(filteredCourses.slice(0, 5));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [isAdmin, userDetail?.email]);

    useEffect(() => {
        if (userDetail?.email) {
            getUserCourses();
        }
    }, [userDetail?.email, getUserCourses]);

    return (
        <div className='mt-12'>
            <h2 className='text-3xl font-bold mb-6 text-foreground flex items-center gap-3'>
                <span className="bg-primary/10 p-2 rounded-lg text-primary">
                    <BrainCircuit className="w-6 h-6" />
                </span>
                {isAdmin ? 'Recent Published Courses' : 'Latest Published Courses'}
            </h2>
            {!loading && (
                <p className="text-sm text-muted-foreground mb-6">
                    {totalCourseCount} {totalCourseCount === 1 ? 'course' : 'courses'} available
                    {totalCourseCount > 5 ? ' (showing latest 5)' : ''}
                </p>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-[280px] w-full bg-muted/50 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : courseList?.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {courseList.map((course, index) => (
                        <CourseCard
                            course={course}
                            key={index}
                            refreshData={getUserCourses}
                            href={isAdmin ? `/create-course/${course?.courseId}` : `/create-course/${course?.courseId}/content`}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                    <BrainCircuit className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-muted-foreground">
                        {isAdmin ? 'No courses created yet' : 'No published courses available'}
                    </h3>
                    <p className="text-muted-foreground/80 mt-2">
                        {isAdmin
                            ? 'Start by creating your first AI-powered course above.'
                            : 'Published courses will appear here once an admin publishes them.'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default UserCourseList;
