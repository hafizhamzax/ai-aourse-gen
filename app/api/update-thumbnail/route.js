import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { CourseList } from '@/configs/schema'; // ✅ Use CourseList
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("API Payload:", body);

    const { courseId, thumbnail } = body;

    if (!courseId || !thumbnail) {
      console.error("Missing courseId or thumbnail");
      return NextResponse.json({ error: 'Missing courseId or thumbnail' }, { status: 400 });
    }

    const result = await db
      .update(CourseList) // ✅ Use CourseList
      .set({ thumbnail })
      .where(eq(CourseList.courseId, courseId))
      .returning();

    console.log("DB update result:", result);

    return NextResponse.json({ success: true, updated: result[0] });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}