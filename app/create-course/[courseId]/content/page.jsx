"use client";

import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

function CourseContent({ params }) {
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const resolvedParams = use(params);

  const fetchCourseAndContent = async () => {
    if (!resolvedParams?.courseId || !user?.primaryEmailAddress?.emailAddress) return;
    
    setLoading(true);
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/get-course/${resolvedParams.courseId}`);
      const courseData = await courseRes.json();

      if (courseData.course && courseData.course.createdBy === user.primaryEmailAddress.emailAddress) {
        setCourse(courseData.course);
        
        // Fetch generated content
        const contentRes = await fetch(`/api/get-course-content/${resolvedParams.courseId}`);
        const contentData = await contentRes.json();
        
        if (contentData.chapters) {
          setChapters(contentData.chapters);
        } else {
          // No content found, redirect back to course layout
          router.push(`/course/${resolvedParams.courseId}`);
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
  }, [resolvedParams?.courseId, user?.primaryEmailAddress?.emailAddress]);

  const handleChapterSelect = (index) => {
    setSelectedChapter(index);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const currentChapter = chapters[selectedChapter];

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
        <button
          onClick={() => router.push(`/create-course/${resolvedParams.courseId}`)}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go Back to Generate Content
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Course Chapters</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{course.name}</p>
          </div>

          {/* Chapter List */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-2">
              {chapters.map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => handleChapterSelect(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    selectedChapter === index
                      ? 'bg-purple-100 border-2 border-purple-500 text-purple-800'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          selectedChapter === index
                            ? 'bg-purple-200 text-purple-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          Chapter {index + 1}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm leading-tight">
                        {chapter.content.title}
                      </h3>
                      {chapter.content.estimatedTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          ⏱️ {chapter.content.estimatedTime}
                        </p>
                      )}
                    </div>
                    {selectedChapter === index && (
                      <div className="ml-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => router.push(`/create-course/${resolvedParams.courseId}`)}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Course Layout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{course.name}</h1>
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
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedChapter === 0
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    Chapter {selectedChapter + 1} of {chapters.length}
                  </span>
                </div>

                <button
                  onClick={() => handleChapterSelect(Math.min(chapters.length - 1, selectedChapter + 1))}
                  disabled={selectedChapter === chapters.length - 1}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedChapter === chapters.length - 1
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Chapter Content */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Chapter Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-purple-200 text-sm font-medium">Chapter {selectedChapter + 1}</span>
                      <h1 className="text-3xl font-bold mb-1">{currentChapter.content.title}</h1>
                      {currentChapter.content.subtitle && <p className="text-purple-100 text-lg">{currentChapter.content.subtitle}</p>}
                    </div>
                    {currentChapter.content.estimatedTime && (
                      <div className="text-right">
                        <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                          <span className="text-sm">⏱️ {currentChapter.content.estimatedTime}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Learning Objectives */}
                  {currentChapter.content.learningObjectives && currentChapter.content.learningObjectives.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        🎯 Learning Objectives
                      </h2>
                      <ul className="space-y-2">
                        {currentChapter.content.learningObjectives.map((obj, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-2 mt-1">✓</span>
                            <span className="text-gray-700">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      📖 Overview
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{currentChapter.content.description}</p>
                    </div>
                  </div>

                  {/* Key Points */}
                  {currentChapter.content.keyPoints && currentChapter.content.keyPoints.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        💡 Key Points
                      </h2>
                      <div className="grid md:grid-cols-2 gap-3">
                        {currentChapter.content.keyPoints.map((point, idx) => (
                          <div key={idx} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                            <p className="text-gray-700 text-sm">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practical Example */}
                  {currentChapter.content.practicalExample && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        🔍 Practical Example
                      </h2>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{currentChapter.content.practicalExample}</p>
                      </div>
                    </div>
                  )}

                  {/* Code Section */}
                  {currentChapter.content.code && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        💻 Code Example
                      </h2>
                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-4 py-2 text-gray-300 text-sm font-medium">
                          Code Example
                        </div>
                        <pre className="p-4 overflow-x-auto">
                          <code className="text-green-400 text-sm">{currentChapter.content.code}</code>
                        </pre>
                      </div>
                      {currentChapter.content.codeExplanation && (
                        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-800 mb-2">Code Explanation:</h3>
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">{currentChapter.content.codeExplanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tips and Common Mistakes */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {currentChapter.content.tips && currentChapter.content.tips.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          💡 Pro Tips
                        </h2>
                        <div className="space-y-2">
                          {currentChapter.content.tips.map((tip, idx) => (
                            <div key={idx} className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                              <p className="text-gray-700 text-sm">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentChapter.content.commonMistakes && currentChapter.content.commonMistakes.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          ⚠️ Common Mistakes
                        </h2>
                        <div className="space-y-2">
                          {currentChapter.content.commonMistakes.map((mistake, idx) => (
                            <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                              <p className="text-gray-700 text-sm">{mistake}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quiz Section */}
                  {currentChapter.content.quiz && currentChapter.content.quiz.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        🧠 Quick Quiz
                      </h2>
                      {currentChapter.content.quiz.map((q, idx) => (
                        <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-3">
                          <p className="font-medium text-gray-800 mb-3">{q.question}</p>
                          <div className="space-y-2 mb-3">
                            {q.options?.map((option, optIdx) => (
                              <div key={optIdx} className="text-gray-700 text-sm">{option}</div>
                            ))}
                          </div>
                          {q.explanation && (
                            <div className="text-sm text-gray-600 bg-white bg-opacity-50 p-2 rounded">
                              <strong>Answer: {q.correct}</strong> - {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Video Section */}
                  {currentChapter.videoId && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        🎥 Recommended Video Tutorial
                      </h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="aspect-video rounded-lg overflow-hidden shadow-md mb-3">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${currentChapter.videoId}?rel=0&modestbranding=1&fs=1`}
                            title={`${currentChapter.content.title} - Video Tutorial`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Curated educational content
                          </span>
                          <a 
                            href={`https://www.youtube.com/watch?v=${currentChapter.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Watch on YouTube →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Further Reading */}
                  {currentChapter.content.furtherReading && currentChapter.content.furtherReading.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        📚 Further Reading
                      </h2>
                      <ul className="space-y-1">
                        {currentChapter.content.furtherReading.map((resource, idx) => (
                          <li key={idx} className="text-blue-600 hover:text-blue-800 text-sm">
                            • {resource}
                          </li>
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
  );
}

export default CourseContent;