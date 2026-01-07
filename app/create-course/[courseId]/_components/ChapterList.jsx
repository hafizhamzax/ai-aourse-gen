import React from 'react';
import { HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';
import EditChapters from './EditChapters';

function ChapterList({ course, setCourse }) {
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
      <h2 className='font-bold text-2xl text-foreground mb-4 border-b pb-2'>📚 Chapters</h2>
      <div className='space-y-4'>
        {output?.Chapters?.map((chapter, index) => (
          <div
            key={index}
            className='flex items-center justify-between p-5 rounded-xl shadow-md border border-border bg-card hover:bg-muted/50 transition-all duration-300'
          >
            <div className='flex gap-5 items-start'>
              <div className='h-12 w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold shadow'>
                {index + 1}
              </div>
              <div>
                <h3 className='font-semibold text-xl text-foreground'>{chapter?.ChapterName}</h3>
                <p className='text-sm text-muted-foreground mt-1'>
                  {chapter?.About ||
                    chapter?.about ||
                    chapter?.description ||
                    "No description"}
                </p>

              </div>
            </div>
            <div className="flex items-center gap-2">
              <EditChapters course={course} index={index} setCourse={setCourse} />
              <HiOutlineCheckCircle className='text-3xl text-green-500' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChapterList;
