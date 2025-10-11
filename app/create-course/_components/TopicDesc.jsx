import { UserInputContext } from '@/app/_context/UserInputContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import React, { useContext } from 'react';

function TopicDesc() {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);

  const handleInputChange = (fieldName, value) => {
    setUserCourseInput((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <div className='max-w-4xl mx-auto bg-white p-6 rounded-xl space-y-6'>
      <div>
        <label className='block mb-2 text-lg font-semibold text-gray-700'>
          Course Topic
        </label>
        <Input
          placeholder='e.g., Introduction to JavaScript'
          defaultValue={userCourseInput?.topic}
          onChange={(e) => handleInputChange('topic', e.target.value)}
          className='text-base p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none'
        />
      </div>

      <div>
        <label className='block mb-2 text-lg font-semibold text-gray-700'>
          Detailed Description
        </label>
        <Textarea
          placeholder='Explain what this course will cover...'
          defaultValue={userCourseInput?.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className='text-base p-4 border border-gray-300 rounded-lg min-h-[150px] focus:ring-2 focus:ring-purple-400 focus:outline-none'
        />
      </div>
    </div>
  );
}

export default TopicDesc;
