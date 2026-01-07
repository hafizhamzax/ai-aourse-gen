import { db } from '@/configs/db';
import { CourseList } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const { courseId } = await params;
  const { title, description, chapters } = await req.json();

  try {
    // Fetch the course
    const courses = await db.select().from(CourseList).where(eq(CourseList.courseId, courseId));
    if (!courses.length) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Parse and update courseOutput
    let courseOutput = courses[0].courseOutput;
    if (typeof courseOutput === 'string') {
      try {
        courseOutput = JSON.parse(courseOutput);
      } catch {
        courseOutput = {};
      }
    }

    // Update Title/Description if provided
    if (title || description) {
      if (!courseOutput.course) courseOutput.course = {};
      if (!courseOutput.course.courseOutput) courseOutput.course.courseOutput = {};
      if (title) courseOutput.course.courseOutput.CourseName = title;
      if (description) courseOutput.course.courseOutput.Description = description;
    }

    // Update Chapters if provided
    if (chapters) {
      courseOutput.Chapters = chapters;
    }

    // Save back to DB
    await db.update(CourseList)
      .set({ courseOutput: JSON.stringify(courseOutput) })
      .where(eq(CourseList.courseId, courseId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}