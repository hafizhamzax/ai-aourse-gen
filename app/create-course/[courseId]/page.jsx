"use client";

import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState, use } from 'react';
import CourseBasicInfo from './_components/CourseBasicInfo';
import CourseDetail from './_components/CourseDetail';
import ChapterList from './_components/ChapterList';
import { db } from '@/configs/db';

import { useRouter } from 'next/navigation';
import { Chapters } from '@/configs/schema';
import { toast } from 'react-hot-toast'; // Add this import
import LoadingDialog from '../_components/LoadingDialog';

import { useUserDetail } from '../_context/UserDetailContext';

function CourseLayout({ params }) {
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isContentGenerated, setIsContentGenerated] = useState(false);
  const [errorState, setErrorState] = useState(null); // Add error state
  const router = useRouter();
  const resolvedParams = use(params);
  const { userDetail, loading: userDetailLoading } = useUserDetail();

  useEffect(() => {
    if (!userDetailLoading && userDetail?.role !== 'admin') {
      router.replace('/dashboard/explore');
    }
  }, [userDetail, userDetailLoading, router]);

  if (userDetailLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;



  const fetchCourse = async () => {
    if (!resolvedParams?.courseId || !user?.primaryEmailAddress?.emailAddress) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/get-course/${resolvedParams.courseId}`);
      const data = await res.json();

      if (data.course && data.course.createdBy === user.primaryEmailAddress.emailAddress) {
        setCourse(data.course);
        // Check if content is already generated
        checkIfContentExists(data.course.courseId);
      } else {
        setCourse(null);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const checkIfContentExists = async (courseId) => {
    try {
      const res = await fetch(`/api/check-course-content/${courseId}`);
      const data = await res.json();
      setIsContentGenerated(data.hasContent || false);
    } catch (error) {
      console.error("Error checking content:", error);
      setIsContentGenerated(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [resolvedParams?.courseId, user?.primaryEmailAddress?.emailAddress]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  if (!course) return <div className="text-center text-gray-600 mt-10">No course found.</div>;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const parseRetryDelayMs = (err) => {
    const msg = String(err?.message || '');
    const m1 = msg.match(/Please retry in ([\d.]+)s/i);
    if (m1) return Math.ceil(parseFloat(m1[1]) * 1000);
    const m2 = msg.match(/\"retryDelay\":\"(\d+)s\"/i);
    if (m2) return parseInt(m2[1], 10) * 1000;
    return null;
  };

  const generateChapterContent = async (prompt) => {

    const attempts = [0, 2000, 5000, 10000, 20000];
    let lastError = null;
    for (let i = 0; i < attempts.length; i++) {
      try {
        const resp = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          const code = resp.status;
          const retryHeader = resp.headers.get('retry-after');
          const retryMs = retryHeader ? parseInt(retryHeader, 10) * 1000 : parseRetryDelayMs({ message: err?.error || '' }) ?? attempts[i + 1] ?? 5000;
          if (code === 429) {
            if (retryMs > 10000) {
              toast.error(`Rate limit hit. Please try again in ~${Math.round(retryMs / 1000)}s.`);
              break;
            }
            await sleep(retryMs);
            continue;
          }
          if (code === 503) {
            await sleep(attempts[i + 1] ?? 3000);
            continue;
          }
          throw new Error(err?.error || `HTTP ${code}`);
        }
        const data = await resp.json();
        const text = data?.text || '';
        if (text && text.trim().length > 0) {
          return text;
        }
        lastError = new Error('Empty response');
      } catch (error) {
        lastError = error;
        const msg = String(error?.message || '').toLowerCase();
        if (msg.includes('429') || msg.includes('quota')) {
          const retryMs = parseRetryDelayMs(error) ?? attempts[i + 1] ?? 5000;
          if (retryMs > 10000) {
            toast.error(`Rate limit hit. Please try again in ~${Math.round(retryMs / 1000)}s.`);
            break;
          }
          await sleep(retryMs);
          continue;
        }
        if (msg.includes('503') || msg.includes('overloaded') || msg.includes('unavailable')) {
          const retryMs = attempts[i + 1] ?? 3000;
          await sleep(retryMs);
          continue;
        }
        if (msg.includes('404') || msg.includes('not found')) {
          console.error('Selected model not available. Ensure the configured AI model is enabled.');
          break;
        }
        break;
      }
    }
    console.error("Error generating content:", lastError);
    return "";
  };

  const extractJson = (text) => {
    const s = text ?? '';
    const start = s.indexOf('{');
    if (start === -1) return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (inString) {
        if (!escape && ch === '"') inString = false;
        escape = ch === '\\' && !escape;
      } else {
        if (ch === '"') inString = true;
        else if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) return s.slice(start, i + 1);
        }
      }
    }
    return null;
  };

  const sanitizeJson = (jsonStr) => {
    return (jsonStr ?? '')
      .replace(/```json|```/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/[\u0000-\u001F]/g, ' ')
      .replace(/,\s*(}|\])/g, '$1')
      .trim();
  };

  const parseGenerated = (raw) => {
    try {
      const cleaned = sanitizeJson(raw);
      const inner = extractJson(cleaned) || cleaned;
      if (!inner || inner.trim().length === 0) return null;
      return JSON.parse(sanitizeJson(inner));
    } catch {
      return null;
    }
  };

  const GenerateChapterContent = async (course) => {
    let output = course?.courseOutput;
    if (typeof output === 'string') {
      try {
        output = JSON.parse(output);
      } catch (e) {
        console.error("Error parsing courseOutput:", e);
        output = {};
      }
    }
    const chapters = output?.Chapters || [];
    console.log("Starting generation for", chapters.length, "chapters");
    setIsGenerating(true);
    setGenerationProgress(0);
    setErrorState(null);

    try {
      for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index];
        const courseName = course?.name || "Unnamed Course";
        const chapterName = chapter?.name || chapter?.ChapterName || `Chapter ${index + 1}`;
        const courseCategory = course?.catagory || "General";
        const courseDifficulty = course?.level || "Beginner";

        // Enhanced, detailed prompt for better content generation
        const PROMPT = `
        Create comprehensive educational content for an online course chapter. Return only valid JSON (UTF-8), with double-quoted keys and strings, and no trailing commas.

        Course Details:
        - Course Name: ${courseName}
        - Category: ${courseCategory}
        - Difficulty Level: ${courseDifficulty}
        - Chapter: ${chapterName}

        Generate JSON with the following structure:
        {
          "title": "Clear, engaging chapter title",
          "subtitle": "Brief compelling subtitle",
          "description": "Comprehensive 300-500 word explanation covering key concepts, importance, and real-world applications",
          "learningObjectives": ["objective 1", "objective 2", "objective 3", "objective 4"],
          "keyPoints": ["important point 1", "important point 2", "important point 3", "important point 4", "important point 5"],
          "practicalExample": "Detailed real-world example with step-by-step explanation",
          "code": "Relevant code example with comments (if applicable to the topic)",
          "codeExplanation": "Line-by-line explanation of the code (if code provided)",
          "commonMistakes": ["common mistake 1", "common mistake 2", "common mistake 3"],
          "tips": ["helpful tip 1", "helpful tip 2", "helpful tip 3"],
          "quiz": [
            {"question": "Q1", "options": ["A) ...","B) ...","C) ...","D) ..."], "correct": "A", "explanation": "..."},
            {"question": "Q2", "options": ["A) ...","B) ...","C) ...","D) ..."], "correct": "B", "explanation": "..."},
            {"question": "Q3", "options": ["A) ...","B) ...","C) ...","D) ..."], "correct": "C", "explanation": "..."},
            {"question": "Q4", "options": ["A) ...","B) ...","C) ...","D) ..."], "correct": "D", "explanation": "..."},
            {"question": "Q5", "options": ["A) ...","B) ...","C) ...","D) ..."], "correct": "A", "explanation": "..."}
          ],
          "furtherReading": ["Resource 1", "Resource 2", "Resource 3"],
          "estimatedTime": "X minutes to complete"
        }

        Make the content engaging, educational, and appropriate for ${courseDifficulty} level students. Include practical examples and make it comprehensive.
        `;

        try {
          const result = await generateChapterContent(PROMPT);
          let content = parseGenerated(result);

          if (!content) {
            console.warn("JSON parsing failed, using fallback for chapter:", chapterName);
            content = {
              title: chapterName,
              subtitle: `Learn about ${chapterName}`,
              description: result?.substring(0, 500) || `Comprehensive guide about ${chapterName}`,
              learningObjectives: [`Understand ${chapterName}`, `Apply ${chapterName} concepts`],
              keyPoints: [`Key concept 1 about ${chapterName}`, `Key concept 2 about ${chapterName}`],
              practicalExample: "Practical example will be provided",
              code: "",
              codeExplanation: "",
              commonMistakes: ["Common mistake 1", "Common mistake 2"],
              tips: ["Helpful tip 1", "Helpful tip 2"],
              quiz: [],
              furtherReading: [],
              estimatedTime: "15 minutes"
            };
          }

          // Enhanced video search with multiple strategies
          let videoId = "";
          const searchQueries = [
            `${chapterName} ${courseCategory} tutorial explained`,
            `learn ${chapterName} ${courseCategory} beginner`,
            `${chapterName} complete guide ${courseCategory}`,
            `${chapterName} step by step tutorial`,
            `${courseCategory} ${chapterName} crash course`,
            `${chapterName} explained simply`
          ];

          // Try multiple search queries to find the best video
          for (const query of searchQueries) {
            try {
              const videoResp = await fetch('/api/youtube/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: query,
                  maxResults: 10,
                  order: 'relevance',
                  type: 'video',
                  duration: 'medium' // Prefer medium length videos (4-20 min)
                })
              });

              if (!videoResp.ok) {
                throw new Error(`YouTube search failed: ${videoResp.status}`);
              }

              const videoData = await videoResp.json();

              if (videoData && videoData.length > 0) {
                // Filter and rank videos based on quality indicators
                const qualityVideos = videoData.filter(video => {
                  const title = video.snippet?.title?.toLowerCase() || '';
                  const channelTitle = video.snippet?.channelTitle?.toLowerCase() || '';
                  const description = video.snippet?.description?.toLowerCase() || '';

                  // Quality indicators
                  const hasEducationalKeywords = /tutorial|learn|guide|course|explained|beginner|complete|step|how to|crash course/.test(title);
                  const hasRelevantContent = title.includes(chapterName.toLowerCase()) ||
                    description.includes(chapterName.toLowerCase());
                  const isFromEducationalChannel = /academy|education|learning|tech|coding|university|institute|official/.test(channelTitle);
                  const hasGoodLength = !title.includes('shorts') && !title.includes('#shorts');

                  return hasEducationalKeywords && hasRelevantContent && hasGoodLength;
                });

                if (qualityVideos.length > 0) {
                  // Rank videos by quality score
                  const rankedVideos = qualityVideos.map(video => {
                    const title = video.snippet?.title?.toLowerCase() || '';
                    const channelTitle = video.snippet?.channelTitle?.toLowerCase() || '';
                    const description = video.snippet?.description?.toLowerCase() || '';

                    let score = 0;

                    // Scoring criteria
                    if (title.includes('tutorial')) score += 10;
                    if (title.includes('complete')) score += 8;
                    if (title.includes('beginner')) score += 7;
                    if (title.includes('explained')) score += 6;
                    if (title.includes('guide')) score += 5;
                    if (title.includes('step by step')) score += 9;
                    if (title.includes('crash course')) score += 8;

                    // Educational channel bonus
                    if (/academy|education|learning|tech|coding|university|institute/.test(channelTitle)) score += 15;

                    // Exact topic match bonus
                    if (title.includes(chapterName.toLowerCase())) score += 20;
                    if (title.includes(courseCategory.toLowerCase())) score += 10;

                    // Penalty for clickbait indicators
                    if (/amazing|shocking|unbelievable|secret|hack/.test(title)) score -= 5;

                    return { ...video, qualityScore: score };
                  }).sort((a, b) => b.qualityScore - a.qualityScore);

                  videoId = rankedVideos[0]?.id?.videoId || "";
                  if (videoId) break; // Found a good video, stop searching
                }
              }
            } catch (error) {
              console.error(`Error searching with query "${query}":`, error);
              continue;
            }
          }

          // Fallback: if no video found, try a simple search
          if (!videoId) {
            try {
              const fallbackResp = await fetch('/api/youtube/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: `${chapterName} ${courseCategory} tutorial`,
                  maxResults: 10,
                  order: 'relevance',
                  type: 'video',
                  duration: 'medium'
                })
              });

              if (fallbackResp.ok) {
                const fallbackData = await fallbackResp.json();
                videoId = fallbackData[0]?.id?.videoId || "";
              }
            } catch (error) {
              console.error("Fallback video search failed:", error);
            }
          }

          // Save to database via Secure API
          const saveResp = await fetch(`/api/courses/${course?.courseId}/chapters`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chapterId: index,
              content: content,
              videoId: videoId
            })
          });

          if (!saveResp.ok) {
            const errData = await saveResp.json();
            throw new Error(errData.error || 'Failed to save chapter to DB');
          }

          // Update progress
          setGenerationProgress(((index + 1) / chapters.length) * 100);

        } catch (e) {
          console.error("Error generating chapter content:", e);
          // Still update progress even on error
          setGenerationProgress(((index + 1) / chapters.length) * 100);
        }
      }

      setIsGenerating(false);
      setGenerationProgress(100);
      setIsContentGenerated(true);

      // Show success message
      toast.success("Content generated successfully! You can now view the course content.");

    } catch (error) {
      console.error("Error in GenerateChapterContent:", error);
      setIsGenerating(false);
      setErrorState({
        message: "Failed to generate content",
        details: error.message
      });
      toast.error("Failed to generate content. Please try again.");
    }
  };

  const handlePublishCourse = async () => {
    try {
      setIsGenerating(true);
      setErrorState(null);

      const res = await fetch(`/api/publish-course/${resolvedParams.courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        // Show detailed error from server
        throw new Error(data.error || `HTTP ${res.status}: ${data.message || 'Unknown error'}`);
      }

      if (data.success) {
        toast.success('Course published successfully!');
        setCourse(prev => ({ ...prev, isPublished: true }));

        // Optionally redirect to published course view
        // router.push(`/courses/${resolvedParams.courseId}`);
      } else {
        throw new Error(data.message || 'Publish failed');
      }
    } catch (error) {
      console.error('Full publish error:', error);
      toast.error(`Publish failed: ${error.message}`);

      // Show detailed error in UI for debugging
      setErrorState({
        message: error.message,
        details: error.details || error.stack
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewContent = () => {
    // Navigate to the content viewing route
    router.push(`/create-course/${resolvedParams.courseId}/content`);
  };

  return (
    <div className='mt-10 px-7 md:px-20 lg:px-44'>
      <h2 className='font-bold text-center text-2xl mb-8'>Course Layout</h2>
      <CourseBasicInfo course={course} setCourse={setCourse} />
      <CourseDetail course={course} />
      <ChapterList course={course} setCourse={setCourse} />

      {/* Error Display */}
      {errorState && (
        <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Error: {errorState.message}</h3>
          {errorState.details && (
            <details className="mt-2">
              <summary className="text-red-600 cursor-pointer">Show Details</summary>
              <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">{errorState.details}</pre>
            </details>
          )}
        </div>
      )}


      {/* Loading Dialog for Content Generation */}
      <LoadingDialog loading={isGenerating} />

      {/* Action Buttons Section - Only show when NOT generating */}
      {!isGenerating && (
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-center justify-center">

          {/* 1. Generate Content Button (Initial State) */}
          {!isContentGenerated && (
            <button
              onClick={() => GenerateChapterContent(course)}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-primary font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:scale-105 shadow-xl shadow-primary/30"
            >
              <span className="mr-3 text-xl">✨</span>
              Generate Course Content
              <div className="absolute -inset-3 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-shine" />
            </button>
          )}

          {/* 2. View Course & Publish Buttons (Success State) */}
          {isContentGenerated && (
            <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={handleViewContent}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-500 border border-transparent rounded-full hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Course Content
              </button>

              {!course?.isPublished && (
                <button
                  onClick={handlePublishCourse}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-full hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg hover:shadow-blue-600/30 transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Publish Course
                </button>
              )}
              {course?.isPublished && (
                <div className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-green-700 bg-green-100 border border-green-200 rounded-full cursor-default">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Published
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseLayout;
