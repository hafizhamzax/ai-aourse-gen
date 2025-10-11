"use client";

import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState, use } from 'react';
import CourseBasicInfo from './_components/CourseBasicInfo';
import CourseDetail from './_components/CourseDetail';
import ChapterList from './_components/ChapterList';
import { db } from '@/configs/db';

import { GoogleGenAI } from '@google/genai';
import { useRouter } from 'next/navigation';
import { Chapters } from '@/configs/schema';
import { toast } from 'react-hot-toast'; // Add this import

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

  const ai = React.useMemo(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    }
    return null;
  }, []);

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

  const generateChapterContent = async (prompt) => {
    if (!ai) {
      console.error("Gemini AI not initialized.");
      return "";
    }
    try {
      const config = { responseMimeType: 'text/plain' };
      const model = 'gemini-2.5-flash';
      const contents = [{ role: 'user', parts: [{ text: prompt }] }];
      const response = await ai.models.generateContentStream({ model, config, contents });

      let resultText = '';
      for await (const chunk of response) {
        resultText += chunk.text;
      }
      return resultText;
    } catch (error) {
      console.error("Error generating content:", error);
      return "";
    }
  };

  const GenerateChapterContent = async (course) => {
    const chapters = course?.courseOutput?.Chapters || [];
    setIsGenerating(true);
    setGenerationProgress(0);
    setErrorState(null);

    try {
      for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index];
        const courseName = course?.name || "Unnamed Course";
        const chapterName = chapter?.name || chapter?.ChapterName || `Chapter ${index + 1}`;
        const courseCategory = course?.category || "General";
        const courseDifficulty = course?.level || "Beginner";

        // Enhanced, detailed prompt for better content generation
        const PROMPT = `
        Create comprehensive educational content for an online course chapter. Generate detailed, well-structured content in JSON format.

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
            {
              "question": "Multiple choice question",
              "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
              "correct": "A",
              "explanation": "Why this answer is correct"
            }
          ],
          "furtherReading": ["Resource 1", "Resource 2", "Resource 3"],
          "estimatedTime": "X minutes to complete"
        }

        Make the content engaging, educational, and appropriate for ${courseDifficulty} level students. Include practical examples and make it comprehensive.
        `;

        try {
          const result = await generateChapterContent(PROMPT);
          const cleanResult = result.replace(/```json|```/g, '').trim();
          let content;
          
          try {
            content = JSON.parse(cleanResult);
          } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            // Fallback content structure
            content = {
              title: chapterName,
              subtitle: `Learn about ${chapterName}`,
              description: result.substring(0, 500) + "...",
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
                body: JSON.stringify({ query: `${chapterName} tutorial` })
              });
              
              if (fallbackResp.ok) {
                const fallbackData = await fallbackResp.json();
                videoId = fallbackData[0]?.id?.videoId || "";
              }
            } catch (error) {
              console.error("Fallback video search failed:", error);
            }
          }

          // Save to database
          await db.insert(Chapters).values({
            chapterId: index,
            courseId: course?.courseId,
            content: content,
            videoId: videoId
          });

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
      <ChapterList course={course} />

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

      <div className="my-10 text-center space-y-4">
        {!isContentGenerated ? (
          <button
            onClick={() => GenerateChapterContent(course)}
            disabled={isGenerating}
            className={`w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-600 transition duration-300 ease-in-out transform hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isGenerating ? 'animate-pulse' : ''}`}
          >
            {isGenerating ? 'Generating Content...' : 'Generate Content'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Content Generated Successfully!</span>
            </div>
            <button
              onClick={handleViewContent}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full shadow-lg hover:from-emerald-600 hover:to-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 cursor-pointer"
            >
              View Course Content
            </button>
          </div>
        )}

        {/* Publish Button */}
        {isContentGenerated && !course?.isPublished && (
          <button
            onClick={handlePublishCourse}
            disabled={isGenerating}
            className={`w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:from-cyan-600 hover:to-blue-600 cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </span>
            ) : (
              'Publish Course'
            )}
          </button>
        )}

        {/* Published Status */}
        {course?.isPublished && (
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Course Published Successfully!</span>
          </div>
        )}
        
        {/* Progress Bar */}
        {isGenerating && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="text-sm text-gray-600 mb-2">
              {generationProgress < 100 ? `Generating chapters... ${Math.round(generationProgress)}%` : 'Processing...'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseLayout;