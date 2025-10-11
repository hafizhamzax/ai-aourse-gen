import React, { useContext } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { UserInputContext } from '@/app/_context/UserInputContext';

function Options() {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);

  const handleInputChange = (fieldName, value) => {
    setUserCourseInput((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Level */}
        <div className='space-y-2'>
          <label className='block text-lg font-semibold text-gray-700'>Course Level</label>
          <Select
            onValueChange={(value) => handleInputChange('level', value)}
            defaultValue={userCourseInput?.level}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400">
              <SelectValue placeholder="Choose level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Advance">Advance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className='space-y-2'>
          <label className='block text-lg font-semibold text-gray-700'>Course Duration</label>
          <Select
            onValueChange={(value) => handleInputChange('duration', value)}
            defaultValue={userCourseInput?.duration}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400">
              <SelectValue placeholder="Choose duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 hour">1 hour</SelectItem>
              <SelectItem value="2 hours">2 hours</SelectItem>
              <SelectItem value="3 hours">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Video Option */}
        <div className='space-y-2'>
          <label className='block text-lg font-semibold text-gray-700'>Include Video</label>
          <Select
            onValueChange={(value) => handleInputChange('displayVid', value)}
            defaultValue={userCourseInput?.displayVid}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400">
              <SelectValue placeholder="Video option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Chapters */}
<div className='space-y-2'>
  <label className='block text-lg font-semibold text-gray-700'>Number of Chapters</label>
  <Select
    onValueChange={(value) => handleInputChange('noChapter', value)}
    defaultValue={userCourseInput?.noChapter}
  >
    <SelectTrigger className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400">
      <SelectValue placeholder="Select chapters count" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="3">3</SelectItem>
      <SelectItem value="5">5</SelectItem>
      <SelectItem value="7">7</SelectItem>
    </SelectContent>
  </Select>
</div>

      </div>
    </div>
  );
}

export default Options;
