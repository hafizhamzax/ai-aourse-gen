import { db } from '@/configs/db'; // Drizzle DB instance
import { Chapters } from '@/configs/schema'; // Your chapters schema
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { courseId } = params;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(Chapters)
      .where(eq(Chapters.courseId, courseId));

    if (!result || result.length === 0) {
      return NextResponse.json({ message: 'No content found for this course' }, { status: 200 });
    }

    return NextResponse.json({ chapters: result });
  } catch (error) {
    console.error('[GET_COURSE_CONTENT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
