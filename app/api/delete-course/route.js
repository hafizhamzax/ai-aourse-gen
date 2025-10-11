// app/api/delete-course/route.js
import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { CourseList, Chapters } from '@/configs/schema'; // ✅ use CourseList instead of Courses
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    console.log("Deleting course and chapters for courseId:", courseId);

    // ✅ Delete related chapters
    await db.delete(Chapters).where(eq(Chapters.courseId, courseId));

    // ✅ Delete course from CourseList
    await db.delete(CourseList).where(eq(CourseList.courseId, courseId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
