import { db } from '@/configs/db';
import { Chapters } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { courseId } = params;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const chapters = await db
      .select()
      .from(Chapters)
      .where(eq(Chapters.courseId, courseId));

    const hasContent = chapters.length > 0;

    return NextResponse.json({ hasContent });
  } catch (error) {
    console.error('[CHECK_COURSE_CONTENT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
