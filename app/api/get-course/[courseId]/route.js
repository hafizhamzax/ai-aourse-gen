import { db } from '@/configs/db';
import { CourseList } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { courseId } = await params;
  try {
    const result = await db.select().from(CourseList).where(
      eq(CourseList.courseId, courseId)
    );
    return NextResponse.json({ course: result[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




