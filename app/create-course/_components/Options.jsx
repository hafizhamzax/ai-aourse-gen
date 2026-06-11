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

  React.useEffect(() => {
    if (!userCourseInput?.level) {
      handleInputChange('level', 'Normal');
    }
    if (!userCourseInput?.includeQuiz) {
      handleInputChange('includeQuiz', 'Yes');
    }
    if (!userCourseInput?.noChapter) {
      handleInputChange('noChapter', '10');
    }
    if (!userCourseInput?.displayVid) {
      handleInputChange('displayVid', 'No');
    }
  }, []);

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6 bg-card rounded-xl border border-border shadow-sm'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Level */}
        <div className='space-y-2'>
          <label className='block text-lg font-semibold text-foreground'>Include Gamified Quiz? <span className="text-red-500">*</span></label>
          <Select
            onValueChange={(value) => handleInputChange('includeQuiz', value)}
            defaultValue={userCourseInput?.includeQuiz || 'Yes'}
          >
            <SelectTrigger className="w-full border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes, include final quiz</SelectItem>
              <SelectItem value="No">No, thanks</SelectItem>

            </SelectContent>
          </Select>
        </div>

        {/* Number of Chapters */}
        <div className='space-y-2'>
          <label className='block text-lg font-semibold text-foreground'>Number of Chapters <span className="text-red-500">*</span></label>

          {userCourseInput?.file ? (
            <div className="p-3 bg-muted rounded-lg border border-border text-muted-foreground text-sm italic">
              Chapters will be auto-generated based on the uploaded book&apos;s content.
            </div>
          ) : (
            <Select
              onValueChange={(value) => handleInputChange('noChapter', value)}
              defaultValue={userCourseInput?.noChapter || '10'}
            >
              <SelectTrigger className="w-full border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground">
                <SelectValue placeholder="Select chapters count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 Chapters (Detailed)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

      </div>
    </div>
  );
}

export default Options;
