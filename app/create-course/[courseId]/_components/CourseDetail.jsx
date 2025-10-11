import React from 'react';
import {
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineBookOpen,
  HiOutlinePlayCircle,
} from 'react-icons/hi2';

const CourseDetail = ({ course }) => {
  if (!course) return null;

  let output = course.courseOutput;
  if (typeof output === 'string') {
    try {
      output = JSON.parse(output);
    } catch {
      output = {};
    }
  }

  const items = [
    {
      icon: <HiOutlineChartBar className="text-3xl text-purple-500" />,
      label: 'Skill Level',
      value: output?.course?.level || course.level || 'Not Specified',
    },
    {
      icon: <HiOutlineClock className="text-3xl text-purple-500" />,
      label: 'Duration',
      value:
        output?.course?.courseOutput?.Duration ||
        output?.course?.courseOutput?.TotalDuration ||
        course.courseOutput?.TotalDuration ||
        course.courseOutput?.Duration ||
        'Not Specified',
    },
    {
      icon: <HiOutlineBookOpen className="text-3xl text-purple-500" />,
      label: 'No. of Chapters',
      value:
        output?.course?.courseOutput?.Chapters?.length ||
        course.courseOutput?.Chapters?.length ||
        '0',
    },
    {
      icon: <HiOutlinePlayCircle className="text-3xl text-purple-500" />,
      label: 'Video Included',
      value:
        output?.course?.includeVideo ||
        course.includeVideo ||
        'Not Specified',
    },
  ];

  return (
    <div className="p-6 rounded-2xl shadow-sm mt-4 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <div>{item.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="font-medium text-base text-gray-700">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;
