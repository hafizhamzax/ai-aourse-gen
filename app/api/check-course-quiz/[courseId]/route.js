import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { CourseQuiz } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function GET(req, { params }) {
    // Await params as per Next.js 15+ requirements
    const { courseId } = await params;
    const quiz = await db.select().from(CourseQuiz).where(eq(CourseQuiz.courseId, courseId));
    return NextResponse.json({ hasQuiz: quiz.length > 0 });
}
