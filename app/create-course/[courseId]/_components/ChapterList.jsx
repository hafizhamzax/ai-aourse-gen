import React from 'react';
import { HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';


function ChapterList({ course }) {
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

  return (
    <div className='mt-5 px-4'>
      <h2 className='font-bold text-2xl text-gray-800 mb-4 border-b pb-2'>📚 Chapters</h2>
      <div className='space-y-4'>
        {output?.Chapters?.map((chapter, index) => (
          <div
            key={index}
            className='flex items-center justify-between p-5 rounded-xl shadow-md border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-100 hover:from-indigo-100 hover:to-purple-200 transition-all duration-300'
          >
            <div className='flex gap-5 items-start'>
              <div className='h-12 w-12 flex items-center justify-center rounded-full bg-indigo-600 text-white text-lg font-bold shadow'>
                {index + 1}
              </div>
              <div>
                <h3 className='font-semibold text-xl text-indigo-800'>{chapter?.ChapterName}</h3>
                <p className='text-sm text-gray-600 mt-1'>
  {chapter?.About ||
   chapter?.about ||
   chapter?.description ||
   "No description"}
</p>
                <p className='flex items-center gap-2 text-sm text-purple-600 mt-2'>
                  <HiOutlineClock className='text-lg' />
                  {chapter?.Duration}
                </p>
              </div>
            </div>
            <HiOutlineCheckCircle className='text-3xl text-green-400' />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChapterList;
