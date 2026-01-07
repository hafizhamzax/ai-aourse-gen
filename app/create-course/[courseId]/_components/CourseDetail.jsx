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
      icon: <HiOutlineChartBar className="text-3xl text-primary" />,
      label: 'Skill Level',
      value: output?.course?.level || course.level || 'Not Specified',
    },
    {
      icon: <HiOutlineBookOpen className="text-3xl text-primary" />,
      label: 'No. of Chapters',
      value:
        output?.course?.courseOutput?.Chapters?.length ||
        course.courseOutput?.Chapters?.length ||
        '0',
    },
    {
      icon: <HiOutlinePlayCircle className="text-3xl text-primary" />,
      label: 'Video Included',
      value:
        output?.course?.includeVideo ||
        course.includeVideo ||
        'Not Specified',
    },
  ];

  return (
    <div className="p-6 rounded-2xl shadow-sm mt-4 bg-card border border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl shadow-sm hover:shadow-md transition hover:bg-muted"
          >
            <div>{item.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium text-base text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;
