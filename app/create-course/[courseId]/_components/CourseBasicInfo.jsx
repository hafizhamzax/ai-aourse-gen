import { Button } from '@/components/ui/button';
import React from 'react';
import { HiOutlinePuzzle } from 'react-icons/hi';
import EditCourseBasicInfo from './EditCourseBasicInfo';

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
    output?.course?.courseOutput?.CourseName ||
    course.courseOutput?.CourseName ||
    'Untitled Course';

  const description =
    output?.course?.courseOutput?.Description ||
    course.courseOutput?.Description ||
    'No description provided';

  const category = output?.course?.catagory || course.catagory || 'General';

  return (
    <div className="p-6 sm:p-10 rounded-2xl shadow-md mt-6 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Course Info */}
        <div>
          <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
            {courseName}
            <EditCourseBasicInfo course={course} setCourse={setCourse} />
          </h2>

          <p className="text-sm text-gray-500 mt-4 leading-relaxed">{description}</p>

          <h2 className="font-medium mt-4 flex gap-2 items-center text-purple-500">
            <HiOutlinePuzzle className="text-xl" />
            {category}
          </h2>

          {/* <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white">
            🚀 Start Course
          </Button> */}
        </div>

        {/* Right Side: Friendly Welcome (no border) */}
        <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="text-6xl">👋</div>
            <div className="mt-2 text-gray-700 font-semibold text-lg">
              Welcome to your course!
            </div>
            <p className="text-gray-500 text-sm mt-1">Let’s begin your journey 🎓</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBasicInfo;
