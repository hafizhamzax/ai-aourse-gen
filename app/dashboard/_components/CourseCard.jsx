import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Layers, PlayCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CourseCard({ course, refreshData, displayUser = false, href }) {
    const courseHref = href || `/create-course/${course?.courseId}`;
    const hasContent = course?.courseOutput?.chapters?.length > 0 || course?.courseOutput?.Chapters?.length > 0;

    return (
        <div className='group hover:scale-105 transition-all duration-300 ease-in-out'>
            <div className="border border-border rounded-2xl p-0 shadow-sm group-hover:shadow-xl bg-card overflow-hidden h-full flex flex-col">
                {/* Cover Image (clickable) */}
                <Link href={courseHref} className="cursor-pointer">
                    <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20">
                        {course?.thumbnail ? (
                            <Image
                                src={course?.thumbnail}
                                alt={course?.name}
                                width={500}
                                height={200}
                                className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                <BookOpen className="w-16 h-16 text-primary/40 group-hover:text-primary/60 transition-colors" />
                            </div>
                        )}


                    </div>
                </Link>

                <div className="p-5 flex-1 flex flex-col gap-3">
                    {/* Title & Category (clickable) */}
                    <Link href={courseHref} className="flex-1 cursor-pointer">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                {course?.courseOutput?.courseName || course?.courseOutput?.CourseName || course?.name || 'Untitled Course'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                {course?.catagory || 'General'}
                            </p>
                        </div>
                    </Link>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                {course?.courseOutput?.chapters?.length || course?.courseOutput?.Chapters?.length || 0} Chapters
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                        <div className="flex gap-2 mt-2">
                            {hasContent && (
                                <>
                                    <Link href={`/create-course/${course?.courseId}/content`} className="flex-1">
                                        <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700">
                                            <PlayCircle className="w-4 h-4 mr-2" />
                                            View Course
                                        </Button>
                                    </Link>
                                    <Link href={`/create-course/${course?.courseId}/quiz`} className="flex-1">
                                        <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                                            <HelpCircle className="w-4 h-4 mr-2" />
                                            Take Quiz
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                    {/* Optional: User Info */}
                    {displayUser && (
                        <div className="flex items-center gap-2">
                            <Image src={course?.userProfileImage} width={24} height={24} className="rounded-full" alt="user" />
                            <span className="text-xs text-muted-foreground">{course?.userName}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
