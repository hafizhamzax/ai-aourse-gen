import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { Chapters } from '@/configs/schema';
import { eq, and } from 'drizzle-orm';

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id || '';
    }
    if (u.searchParams.get('v')) {
      return u.searchParams.get('v') || '';
    }
    const parts = u.pathname.split('/');
    const embedIndex = parts.indexOf('embed');
    if (embedIndex !== -1 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1];
    }
    return '';
  } catch {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : '';
  }
}

export async function POST(req, { params }) {
  try {
    const { courseId, chapterId } = await params;
    if (!courseId || typeof chapterId === 'undefined') {
      return NextResponse.json({ error: 'Missing courseId or chapterId' }, { status: 400 });
    }

    const body = await req.json();
    let { videoId, videoUrl, isCustom } = body || {};

    if (!isCustom && !videoId && videoUrl) {
      videoId = extractVideoId(videoUrl);
    }

    // Validation
    if (!isCustom) {
      if (!videoId || typeof videoId !== 'string' || videoId.length < 6) {
        return NextResponse.json({ error: 'Invalid videoId or videoUrl' }, { status: 400 });
      }
    } else {
      if (!videoUrl) {
        return NextResponse.json({ error: 'Missing custom video URL' }, { status: 400 });
      }
    }

    const chapterNum = Number(chapterId);

    const updateData = isCustom
      ? { videoUrl, videoId: null }
      : { videoId, videoUrl: null };

    const result = await db
      .update(Chapters)
      .set(updateData)
      .where(and(eq(Chapters.courseId, courseId), eq(Chapters.chapterId, chapterNum)))
      .returning();

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, chapter: result[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
