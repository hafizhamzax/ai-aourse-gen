import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { CourseList, CourseQuiz } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
    try {
        const { courseId } = await req.json();

        // 1. Fetch Course Details
        const course = await db.select().from(CourseList).where(eq(CourseList.courseId, courseId));
        if (!course || course.length === 0) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        const courseData = course[0];
        const chapters = courseData.courseOutput?.chapters || courseData.courseOutput?.Chapters || [];

        // 2. Determine Number of Questions
        const numQuestions = 25; // Exactly 25 questions!

        const difficulty = courseData.level;
        const topic = courseData.courseOutput?.courseName || courseData.courseOutput?.CourseName || courseData.name;

        // 3. Generate Quiz with AI (OpenRouter)
        const prompt = `Generate ${numQuestions} multiple-choice questions (MCQs) for a course on "${topic}" (Level: ${difficulty}).
        The course covers these chapters: ${chapters.map(c => c.chapterName || c.name || c.ChapterName).join(', ')}.
        
        Return the result strictly as a valid JSON array of objects.
        Each object must have:
        - "question": string
        - "options": array of 4 strings
        - "answer": string (must match exactly one of the options)
        
        Do not include any markdown or code blocks. Just the JSON array.`;

        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";

        const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        if (!resp.ok) {
            throw new Error('AI Request Failed: ' + resp.statusText);
        }

        const data = await resp.json();
        let quizJson = data?.choices?.[0]?.message?.content || "[]";

        // Clean JSON
        quizJson = quizJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(quizJson);

        // 4. Save to DB
        await db.insert(CourseQuiz).values({
            courseId: courseId,
            questions: questions,
            createdBy: courseData.createdBy,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Quiz Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
