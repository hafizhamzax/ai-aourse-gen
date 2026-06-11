import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { CourseQuiz } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
    const { courseId } = await req.json();
    const result = await db.select().from(CourseQuiz).where(eq(CourseQuiz.courseId, courseId));
    return NextResponse.json({ quiz: result[0] });
}
