import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { HiOutlinePuzzle } from 'react-icons/hi';
import EditCourseBasicInfo from './EditCourseBasicInfo';
import { supabase } from '@/configs/supabase';

const CourseBasicInfo = ({ course, setCourse }) => {
  if (!course) return null;

  // Parse courseOutput if needed
  let output = course.courseOutput;
  if (typeof output === 'string') {
    try {
      output = JSON.parse(output);
    } catch {
      output = {};
    }
  }

  const courseName =
    output?.courseName ||
    output?.course?.courseOutput?.CourseName ||
    course.courseOutput?.CourseName ||
    course.name ||
    'Untitled Course';

  const description =
    output?.description ||
    output?.course?.courseOutput?.Description ||
    course.courseOutput?.Description ||
    'No description provided';

  const category = output?.course?.catagory || course.catagory || 'General';

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Create a unique filename to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${course.courseId}-thumbnail-${Date.now()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw uploadError;
      }

      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Optimistic update UI
      setCourse(prev => ({ ...prev, thumbnail: publicUrl }));

      // 4. Save URL to Neon DB
      await fetch('/api/update-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.courseId, thumbnail: publicUrl }),
      });

    } catch (err) {
      console.error("Thumbnail upload failed:", err);
    }
  };

  return (
    <div className="p-6 sm:p-10 rounded-2xl shadow-md mt-6 bg-card border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Course Info */}
        <div>
          <h2 className="font-bold text-2xl text-foreground flex items-center gap-2">
            {courseName}
            <EditCourseBasicInfo course={course} setCourse={setCourse} />
          </h2>

          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{description}</p>

          <h2 className="font-medium mt-4 flex gap-2 items-center text-primary">
            <HiOutlinePuzzle className="text-xl" />
            {category}
          </h2>
        </div>

        {/* Right Side: Friendly Welcome (no border) */}
        {/* Right Side: Thumbnail Upload */}
        <div className="flex flex-col items-center justify-center h-[250px] bg-muted/30 rounded-xl overflow-hidden relative border border-input group hover:bg-muted/50 transition-colors">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt="Course Thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <div className="text-5xl mb-2">🖼️</div>
              <div className="text-foreground font-medium">Add Course Thumbnail</div>
              <p className="text-xs text-muted-foreground mt-1">Click to upload image</p>
            </div>
          )}

          <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30">
              {course.thumbnail ? 'Change Image' : 'Upload Image'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default CourseBasicInfo;
