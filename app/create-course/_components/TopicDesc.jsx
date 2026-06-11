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
    <div className='max-w-4xl mx-auto'>
      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-8">

        {/* Topic Input */}
        <div>
          <label className='block mb-3 text-xl font-bold text-foreground tracking-tight'>
            Curriculum Topic <span className="text-primary">*</span>
            <span className="block text-sm font-normal text-muted-foreground mt-1">What is the main subject or title of the course?</span>
          </label>
          <Input
            placeholder='e.g., Quantum Physics 101, Advanced Python Patterns...'
            defaultValue={userCourseInput?.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            className='text-lg p-6 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
          />
        </div>

        {/* Description Input */}
        <div>
          <label className='block mb-3 text-xl font-bold text-foreground tracking-tight'>
            Detailed Synopsis <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
            <span className="block text-sm font-normal text-muted-foreground mt-1">Provide context to help the AI tailor the content.</span>
          </label>
          <Textarea
            placeholder='Describe the target audience, specific modules to include, or the desired outcome...'
            defaultValue={userCourseInput?.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className='text-lg p-6 rounded-xl border-border bg-background min-h-[180px] focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
          />
        </div>
      </div>
    </div>
  );
}

export default TopicDesc;
