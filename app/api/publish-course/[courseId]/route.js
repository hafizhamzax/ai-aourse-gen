// filepath: app/api/publish-course/[courseId]/route.js
import { db } from '@/configs/db';
import { CourseList } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const { courseId } = params;
  try {
    const result = await db
      .update(CourseList)
      .set({ isPublished: true })
      .where(eq(CourseList.courseId, courseId));
    if (result.rowCount > 0 || (Array.isArray(result) && result.length > 0)) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}