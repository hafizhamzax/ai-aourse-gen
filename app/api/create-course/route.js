import { db } from '@/configs/db';
import { CourseList } from '@/configs/schema';
import { NextResponse } from 'next/server';



export async function POST(req) {
  try {
    const body = await req.json();
    await db.insert(CourseList).values({
      courseId: body.courseId,
      name: body.name || body.topic,
      level: body.level,
      catagory: body.catagory,
      includeVideo: body.includeVideo || 'Yes',
      courseOutput: body.courseOutput,
      createdBy: body.createdBy,
      userName: body.userName,
      userProfileImage: body.userProfileImage,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

