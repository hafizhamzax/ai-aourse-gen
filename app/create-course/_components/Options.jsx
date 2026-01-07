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
    <div className='max-w-4xl mx-auto p-6 space-y-6 bg-card rounded-xl border border-border shadow-sm'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Level */}
        <div className='space-y-2'>
          <label className='block text-lg font-semibold text-foreground'>Course Level <span className="text-red-500">*</span></label>
          <Select
            onValueChange={(value) => handleInputChange('level', value)}
            defaultValue={userCourseInput?.level}
          >
            <SelectTrigger className="w-full border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground">
              <SelectValue placeholder="Choose level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Advance">Advance</SelectItem>
            </SelectContent>
          </Select>
        </div>



        {/* Video Option */}
        <div className='space-y-2'>
          <label className='block text-lg font-semibold text-foreground'>Include Video <span className="text-red-500">*</span></label>
          <Select
            onValueChange={(value) => handleInputChange('displayVid', value)}
            defaultValue={userCourseInput?.displayVid}
          >
            <SelectTrigger className="w-full border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground">
              <SelectValue placeholder="Video option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Chapters */}
        <div className='space-y-2 md:col-span-2'>
          <label className='block text-lg font-semibold text-foreground'>Number of Chapters <span className="text-red-500">*</span></label>
          <Select
            onValueChange={(value) => handleInputChange('noChapter', value)}
            defaultValue={userCourseInput?.noChapter}
          >
            <SelectTrigger className="w-full border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground">
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
