import { db } from '@/configs/db';
import { Chapters } from '@/configs/schema';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
    const { courseId } = await params;

    try {
        const body = await req.json();
        console.log("Save Chapter Request for courseId:", courseId, "chapterId:", body.chapterId);
        const { chapters } = body;

        // Insert all chapters in a transaction/batch or loop
        // Since we are generating one by one in the UI, this endpoint might receive ONE chapter or ALL.
        // Looking at the UI logic, it loops and inserts one by one.
        // Let's support saving a single chapter for now to match the UI flow, 
        // OR support bulk if we want to change UI.
        // The UI does: await db.insert(Chapters).values({...}); inside a for loop.
        // So we should expect a SINGLE chapter object in the body or handle accordingly.

        // However, the UI code passes `content` and `videoId`.
        // Let's assume the body contains the fields needed for ONE chapter insertion.

        const { chapterId, content, videoId, videoUrl } = body;

        if (chapterId === undefined || !content) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const result = await db.insert(Chapters).values({
            courseId: courseId,
            chapterId: chapterId,
            content: content,
            videoId: videoId || null,
            videoUrl: videoUrl || null
        }).returning({ id: Chapters.id });

        return NextResponse.json({ success: true, id: result[0]?.id });

    } catch (error) {
        console.error("Error saving chapter:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
