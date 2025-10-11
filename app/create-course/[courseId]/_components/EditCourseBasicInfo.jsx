import React, { useState, useEffect } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

import { HiPencilSquare } from 'react-icons/hi2';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const EditCourseBasicInfo = ({ course, setCourse }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (course) {
      let parsedOutput = course.courseOutput;

      // Parse JSON if it's a string
      if (typeof parsedOutput === 'string') {
        try {
          parsedOutput = JSON.parse(parsedOutput);
        } catch {
          parsedOutput = {};
        }
      }

      const courseName =
        parsedOutput?.course?.courseOutput?.CourseName ||
        parsedOutput?.CourseName ||
        course.courseOutput?.CourseName ||
        'No Name';

      const courseDesc =
        parsedOutput?.course?.courseOutput?.Description ||
        parsedOutput?.Description ||
        course.courseOutput?.Description ||
        'No Description';

      setTitle(courseName);
      setDescription(courseDesc);
    }
  }, [course]);

  if (!course) return null;

  const handleUpdate = async () => {
  // Optimistically update UI first
  setCourse(prev => {
    let output = prev.courseOutput;
    if (typeof output === "string") {
      try {
        output = JSON.parse(output);
      } catch {
        output = {};
      }
    }
    if (!output.course) output.course = {};
    if (!output.course.courseOutput) output.course.courseOutput = {};
    output.course.courseOutput.CourseName = title;
    output.course.courseOutput.Description = description;
    return {
      ...prev,
      courseOutput: typeof prev.courseOutput === "string" ? JSON.stringify(output) : output,
    };
  });

  // Then call the API (can be awaited, but UI is already updated)
  try {
    await fetch(`/api/update-course/${course.courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
      }),
    });
    // Optionally: handle errors and revert state if needed
  } catch (error) {
    console.error("Update failed:", error);
    // Optionally: revert state or show error to user
  }
};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xl p-2">
          <HiPencilSquare />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course Title & Description</DialogTitle>
          <DialogDescription>
            Update the course information below.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseBasicInfo;