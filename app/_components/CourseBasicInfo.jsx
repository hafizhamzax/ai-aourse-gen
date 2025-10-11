"use client";

import React from 'react';

const CourseBasicInfo = ({ course, readOnly = false, setCourse }) => {
  return (
    <div className="mt-5">
      <h2 className="text-lg font-semibold mb-2">Course Name</h2>
      {readOnly ? (
        <p className="text-xl">{course.name}</p>
      ) : (
        <input
          type="text"
          value={course.name}
          onChange={(e) => setCourse({ ...course, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
      )}
      {/* Add other fields similarly */}
    </div>
  );
};

export default CourseBasicInfo;