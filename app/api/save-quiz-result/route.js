import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { UserQuizAttempt } from '@/configs/schema';

export async function POST(req) {
    try {
        const body = await req.json();
        await db.insert(UserQuizAttempt).values({
            courseId: body.courseId,
            userId: body.userId,
            score: body.score,
            totalQuestions: body.totalQuestions,
            isPass: (body.score / body.totalQuestions) >= 0.5,
            attemptedAt: new Date().toISOString()
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
