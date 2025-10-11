import { db } from '@/configs/db';
import { CourseList, Chapters } from '@/configs/schema';
import { eq, exists } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all published courses (uncomment the "exists" part if you want only courses with chapters)
    const courses = await db
      .select()
      .from(CourseList)
      .where(
        eq(CourseList.isPublished, true)
        // Uncomment below to require at least one chapter:
        // .and(
        //   exists(
        //     db.select().from(Chapters).where(eq(Chapters.courseId, CourseList.courseId))
        //   )
        // )
      );

    return new Response(JSON.stringify({ courses }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch courses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}