"use client";

import React, { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/configs/supabase';
import { toast } from 'react-hot-toast';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CourseContent({ params }) {
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const resolvedParams = use(params);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [manualUrl, setManualUrl] = useState('');
  const [savingVideo, setSavingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { userDetail } = useUserDetail();
  const [hasQuiz, setHasQuiz] = useState(false);

  const checkIfQuizExists = async (courseId) => {
    try {
      const res = await fetch(`/api/check-course-quiz/${courseId}`);
      const data = await res.json();
      setHasQuiz(data.hasQuiz);
    } catch (error) {
      console.error("Error checking quiz:", error);
    }
  };

  const fetchCourseAndContent = async () => {
    if (!resolvedParams?.courseId || !userDetail?.email) return;

    setLoading(true);
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/get-course/${resolvedParams.courseId}`);
      const courseData = await courseRes.json();

      if (courseData.course && (courseData.course.createdBy === userDetail.email || courseData.course.isPublished === true || userDetail?.role === 'admin')) {
        setCourse(courseData.course);
        checkIfQuizExists(resolvedParams.courseId);

        // Fetch generated content
        const contentRes = await fetch(`/api/get-course-content/${resolvedParams.courseId}`);
        const contentData = await contentRes.json();

        if (contentData.chapters) {
          setChapters(contentData.chapters);
        } else {
          // No content found, redirect back to course layout
          router.push(`/create-course/${resolvedParams.courseId}`);
        }
      } else {
        setCourse(null);
      }
    } catch (error) {
      console.error("Error fetching course content:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourseAndContent();
  }, [resolvedParams?.courseId, userDetail?.email, userDetail?.role]);

  const handleChapterSelect = (index) => {
    setSelectedChapter(index);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const currentChapter = chapters[selectedChapter];

  // Custom styled components for ReactMarkdown
  const markdownComponents = {
    h1: ({children}) => <h1 className="text-2xl font-bold text-foreground mt-6 mb-3 pb-2 border-b border-border">{children}</h1>,
    h2: ({children}) => <h2 className="text-xl font-bold text-foreground mt-5 mb-2">{children}</h2>,
    h3: ({children}) => <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">{children}</h3>,
    h4: ({children}) => <h4 className="text-base font-semibold text-primary mt-3 mb-1">{children}</h4>,
    // Use div instead of p to avoid invalid HTML when code blocks are nested inside
    p: ({children}) => <div className="text-foreground leading-7 mb-4 text-[15px]">{children}</div>,
    ul: ({children}) => <ul className="list-none space-y-2 mb-4 pl-2">{children}</ul>,
    ol: ({children}) => <ol className="list-decimal list-inside space-y-2 mb-4 pl-2">{children}</ol>,
    li: ({children}) => (
      <li className="flex items-start gap-2 text-foreground text-[15px] leading-relaxed">
        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
        <span>{children}</span>
      </li>
    ),
    strong: ({children}) => <strong className="font-bold text-foreground">{children}</strong>,
    em:     ({children}) => <em className="italic text-muted-foreground">{children}</em>,
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-primary pl-4 py-1 my-4 bg-primary/5 rounded-r-lg text-muted-foreground italic text-[15px]">
        {children}
      </blockquote>
    ),
    // Detect inline code by absence of className (block code has a language-* class)
    code: ({className, children}) => {
      const isBlock = className && className.startsWith('language-');
      if (isBlock) {
        return (
          <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto my-4">
            <code className="text-green-400 font-mono text-sm">{children}</code>
          </pre>
        );
      }
      return <code className="bg-muted text-primary font-mono text-sm px-1.5 py-0.5 rounded">{children}</code>;
    },
    pre: ({children}) => <>{children}</>,
    hr:  () => <hr className="my-6 border-border" />,
  };

  const onVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file');
      return;
    }

    setSavingVideo(true);
    setUploadProgress(10);

    try {
      // Strictly sanitize filename: remove anything that isn't a letter, number, or dot
      const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${Date.now()}-${cleanOriginalName}`;
      const filePath = `course-videos/${resolvedParams.courseId}/${fileName}`;

      console.log('Starting upload to bucket: video-upload, path:', filePath);

      // 1. Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('video-upload')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 90);
            setUploadProgress(percent);
          }
        });

      if (uploadError) {
        console.error('Supabase Storage Upload Error:', uploadError);
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-upload')
        .getPublicUrl(filePath);

      console.log('Generated Public URL:', publicUrl);

      // 3. Save to DB
      const res = await fetch(`/api/set-chapter-video/${resolvedParams.courseId}/${selectedChapter}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: publicUrl,
          isCustom: true
        }),
      });

      if (res.ok) {
        setChapters(prev => prev.map((ch, idx) => idx === selectedChapter ? { ...ch, videoUrl: publicUrl, videoId: null } : ch));
        setVideoModalOpen(false);
        toast.success('Video uploaded successfully!');
      } else {
        throw new Error('Failed to save video URL to database');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video: ' + error.message);
    } finally {
      setSavingVideo(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center text-gray-600 mt-10">No course found.</div>;
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <p>No content generated yet.</p>
        {course?.createdBy === userDetail?.email && (
          <button
            onClick={() => router.push(`/create-course/${resolvedParams.courseId}`)}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back to Generate Content
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-card border border-border shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Course Chapters</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{course.name}</p>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 space-y-2">
                {chapters.map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => handleChapterSelect(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${selectedChapter === index
                      ? 'bg-primary/10 border-2 border-primary text-primary'
                      : 'bg-muted/50 hover:bg-muted border-2 border-transparent text-foreground'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${selectedChapter === index ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            Ch {index + 1}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm leading-tight">{chapter.content.title}</h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border space-y-3">
              {hasQuiz && (
                <button
                  onClick={() => router.push(`/create-course/${resolvedParams.courseId}/quiz`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-md transition-all"
                >
                  🧠 Take Final Quiz
                </button>
              )}
              {userDetail?.role === 'admin' && (
                <button
                  onClick={() => router.push(`/create-course/${resolvedParams.courseId}`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  ← Back to Course Layout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-card shadow-sm border-b border-border p-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-foreground">{course.name}</h1>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 lg:p-10">
            {currentChapter && (
              <div className="max-w-4xl mx-auto">
                {/* Chapter Navigation */}
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={() => handleChapterSelect(Math.max(0, selectedChapter - 1))}
                    disabled={selectedChapter === 0}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedChapter === 0 ? 'text-muted-foreground bg-muted cursor-not-allowed' : 'text-foreground bg-card border border-border hover:bg-muted'}`}
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-muted-foreground">Chapter {selectedChapter + 1} of {chapters.length}</span>
                  <button
                    onClick={() => handleChapterSelect(Math.min(chapters.length - 1, selectedChapter + 1))}
                    disabled={selectedChapter === chapters.length - 1}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedChapter === chapters.length - 1 ? 'text-muted-foreground bg-muted cursor-not-allowed' : 'text-foreground bg-card border border-border hover:bg-muted'}`}
                  >
                    Next →
                  </button>
                </div>

                {/* Chapter Content Card */}
                <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                  {/* Chapter Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                    <span className="text-purple-200 text-sm font-medium">Chapter {selectedChapter + 1}</span>
                    <h1 className="text-3xl font-bold mb-1">{currentChapter.content.title}</h1>
                    {currentChapter.content.subtitle && <p className="text-purple-100 text-lg">{currentChapter.content.subtitle}</p>}
                  </div>

                  <div className="p-6">
                    {/* Learning Objectives */}
                    {currentChapter.content.learningObjectives?.length > 0 && (
                      <div className="mb-8 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                          <span>🎯</span> Learning Objectives
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {currentChapter.content.learningObjectives.map((obj, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/20">
                              <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">{idx + 1}</div>
                              <span className="text-foreground text-sm font-medium">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b-2 border-primary/20 flex items-center gap-2">
                        <span>📖</span> Chapter Content
                      </h2>
                      <div className="max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{currentChapter.content.description}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Key Points */}
                    {currentChapter.content.keyPoints?.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><span>💡</span> Key Points</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          {currentChapter.content.keyPoints.map((point, idx) => (
                            <div key={idx} className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-2xl">
                              <p className="text-foreground text-sm leading-relaxed">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Real World Application */}
                    {currentChapter.content.realWorldApplication && (
                      <div className="mb-8">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><span>🚀</span> Real World Application</h2>
                        <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-2xl p-6">
                          <div className="max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{currentChapter.content.realWorldApplication}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Code Section */}
                    {currentChapter.content.code && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">💻 Code Example</h2>
                        <div className="bg-gray-900 rounded-lg overflow-hidden">
                          <div className="bg-gray-800 px-4 py-2 text-gray-300 text-sm font-medium">Code</div>
                          <pre className="p-4 overflow-x-auto"><code className="text-green-400 text-sm">{currentChapter.content.code}</code></pre>
                        </div>
                        {currentChapter.content.codeExplanation && (
                          <div className="mt-3 bg-muted/50 border border-border rounded-xl p-4">
                            <div className="max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{currentChapter.content.codeExplanation}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tips and Mistakes */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      {currentChapter.content.tips?.length > 0 && (
                        <div className="space-y-3">
                          <h2 className="text-xl font-bold text-green-700 dark:text-green-400">🌟 Expert Tips</h2>
                          {currentChapter.content.tips.map((tip, idx) => (
                            <div key={idx} className="flex gap-3 p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/20 rounded-2xl">
                              <span>⭐</span>
                              <p className="text-green-800 dark:text-green-300 text-sm italic">{`"${tip}"`}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {currentChapter.content.commonMistakes?.length > 0 && (
                        <div className="space-y-3">
                          <h2 className="text-xl font-bold text-rose-700 dark:text-rose-400">🚩 Pitfalls to Avoid</h2>
                          {currentChapter.content.commonMistakes.map((mistake, idx) => (
                            <div key={idx} className="flex gap-3 p-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/20 rounded-2xl">
                              <span>❌</span>
                              <p className="text-rose-800 dark:text-rose-300 text-sm">{mistake}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>



                    {/* Further Reading */}
                    {currentChapter.content.furtherReading?.length > 0 && (
                      <div className="border-t border-border pt-4">
                        <h2 className="text-lg font-semibold text-foreground mb-3">📚 Further Reading</h2>
                        <ul className="space-y-1">
                          {currentChapter.content.furtherReading.map((resource, idx) => (
                            <li key={idx} className="text-primary hover:opacity-80 text-sm">• {resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </>
  );
}

export default CourseContent;
