'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserDetail } from '@/app/_context/UserDetailContext';
import { supabase } from '@/configs/supabase';

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const router = useRouter();
  const { userDetail } = useUserDetail();

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/get-published-courses');
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // Handle delete
  const handleDeleteCourse = async (courseId) => {
    if (userDetail?.role !== 'admin') {
      alert("Only admins can delete courses.");
      return;
    }
    const confirmed = window.confirm('Are you sure you want to delete this course?');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/delete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const result = await res.json();

      if (res.ok) {
        setCourses(prev => prev.filter(c => c.courseId !== courseId));
        alert("Course deleted successfully.");
      } else {
        alert("Delete failed: " + result.error);
      }
    } catch (err) {
      console.error("Request error:", err);
      alert("Failed to delete course.");
    }
  };

  // Handle thumbnail upload (using Supabase!)
  const handleThumbnailUpload = async (e, courseId) => {
    if (userDetail?.role !== 'admin') return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `thumbnails/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Save to DB
      const res = await fetch('/api/update-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, thumbnail: publicUrl }),
      });

      if (res.ok) {
        setCourses(prev =>
          prev.map(course =>
            course.courseId === courseId ? { ...course, thumbnail: publicUrl } : course
          )
        );
      }
    } catch (err) {
      console.error("Thumbnail upload failed:", err);
      alert("Failed to upload thumbnail.");
    }
  };

  // Filter logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.catagory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(courses.map(course => course.catagory))];

  // Check if course has content
  const hasContent = (course) => {
    return (course.courseOutput?.chapters?.length > 0 || course.courseOutput?.Chapters?.length > 0);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
          <p className="text-lg text-muted-foreground">Find the perfect course to expand your knowledge</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            className="block w-full pl-3 pr-10 py-3 text-base border border-border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-xl bg-card text-card-foreground shadow-sm transition-all"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.filter(Boolean).map((cat, i) => (
              <option key={`${cat}-${i}`} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Skeleton Loaders
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="h-10 bg-muted rounded-lg w-full mt-4"></div>
                </div>
              </div>
            ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.courseId} className="group bg-card text-card-foreground shadow-sm hover:shadow-xl border border-border rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="Course Thumbnail" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium uppercase tracking-wider">No Preview</span>
                    </div>
                  )}
                  {userDetail?.role === 'admin' && (
                    <label className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 cursor-pointer shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleThumbnailUpload(e, course.courseId)}
                      />
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Course Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{course.courseOutput?.courseName || course.courseOutput?.CourseName || course.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-4">{course.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {course.catagory}
                    </span>
                  </div>

                  {/* View, Take Quiz & Delete Buttons */}
                  <div className="flex flex-col gap-2">
                    {/* First row: View Course & Take Quiz (if content exists) */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/create-course/${course.courseId}/content`)}
                        className="flex-1 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        View Course
                      </button>

                      {hasContent(course) && (
                        <button
                          onClick={() => router.push(`/create-course/${course.courseId}/quiz`)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-4 py-2.5 rounded-xl hover:from-orange-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Take Quiz
                        </button>
                      )}
                    </div>

                    {/* Delete button (only admin) */}
                    {userDetail?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteCourse(course.courseId)}
                        className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 w-full"
                        title="Delete Course"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-sm font-bold">Delete Course</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 17.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">No courses found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
