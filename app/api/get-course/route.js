import { NextResponse } from 'next/server';
import { db } from '@/configs/db'; // adjust path as needed
import { CourseList } from '@/configs/schema'; // adjust path as needed

export async function GET() {
  try {
    // Fetch all courses from the database
    const courses = await db.select().from(CourseList);

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch courses' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


