'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const router = useRouter();

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

  // Handle thumbnail upload
  const handleThumbnailUpload = async (e, courseId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;

      await fetch('/api/update-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, thumbnail: base64String }),
      });

      setCourses(prev =>
        prev.map(course =>
          course.courseId === courseId ? { ...course, thumbnail: base64String } : course
        )
      );
    };
    reader.readAsDataURL(file);
  };

  // Filter logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.catagory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(courses.map(course => course.catagory))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
          <p className="text-lg text-gray-600">Find the perfect course to expand your knowledge</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search courses..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-lg"
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div key={course.courseId} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Thumbnail */}
              <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="Course Thumbnail" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400">No Thumbnail</span>
                )}
                <label className="absolute bottom-2 right-2 bg-white rounded-full p-1 cursor-pointer shadow">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleThumbnailUpload(e, course.courseId)}
                  />
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </label>
              </div>

              {/* Course Details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{course.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                <div className="mt-3 flex justify-between text-sm text-gray-500">
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{course.catagory}</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">{course.level}</span>
                </div>

                {/* View & Delete Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => router.push(`/create-course/${course.courseId}/content`)}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    View Course
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.courseId)}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
