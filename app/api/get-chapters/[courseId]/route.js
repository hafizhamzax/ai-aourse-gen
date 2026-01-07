import { NextResponse } from 'next/server';
// Adjust DB imports to match your project setup
import { db } from '@/configs/db';
import { Chapters } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function GET(req, { params }) {
  const { courseId } = await params;
  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
  }

  try {
    const chapters = await db.select().from(Chapters).where(eq(Chapters.courseId, courseId));
    return NextResponse.json({ chapters }, { status: 200 });
  } catch (err) {
    console.error('get-chapters error', err);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}