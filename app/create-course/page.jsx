'use client';

import { Button } from '@/components/ui/button';
import React, { useContext, useState } from 'react';

import { toast } from 'react-hot-toast';
import Catagory from './_components/Catagory';
import TopicDesc from './_components/TopicDesc';
import Options from './_components/Options';
import LoadingDialog from './_components/LoadingDialog';
import { UserInputContext } from '../_context/UserInputContext';
import uuid4 from 'uuid4';
import { useRouter } from 'next/navigation';
import { FaTags, FaRegListAlt, FaSlidersH, FaMagic } from 'react-icons/fa';
import { useUserDetail } from '../_context/UserDetailContext';
import categoryList from '@/app/shared/catagoryList';
import { supabase } from '@/configs/supabase';

function CreateCourse() {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fullFileText, setFullFileText] = useState(''); // Cache parsed text
  const { userDetail, loading: userDetailLoading } = useUserDetail();

  React.useEffect(() => {
    if (!userDetailLoading && userDetail?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [userDetail, userDetailLoading, router]);

  if (userDetailLoading) {
    return <div className='flex justify-center items-center h-screen'>Loading...</div>;
  }

  const Step = [
    { id: 1, name: 'Domain', icon: <FaTags /> },
    { id: 2, name: 'Blueprint', icon: <FaRegListAlt /> },
    { id: 3, name: 'Configure', icon: <FaSlidersH /> },
  ];

  const check = () => {
    if (!userCourseInput) return true;

    if (
      activeIndex === 0 &&
      (!userCourseInput.catagory || userCourseInput.catagory.trim() === '')
    ) {
      return true;
    }

    if (activeIndex === 1) {
      if (!userCourseInput.topic || userCourseInput.topic.trim() === '') return true;
    }

    if (activeIndex === 2) {
      if (!userCourseInput.level || !userCourseInput.displayVid || !userCourseInput.noChapter) {
        return true;
      }
    }

    return false;
  };

  const GenerateCourseLayout = async () => {
    setLoading(true);
    setProgress(10);

    let progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 95));
    }, 600);

    try {
      const prompt = `
        Generate A Course Tutorial Layout in Strict JSON Format.
        Your Job: Construct a logical, step-by-step curriculum based on the following metadata.
        
        1. **Category**: ${userCourseInput?.catagory}
        2. **Topic**: ${userCourseInput?.topic}
        3. **Description**: ${userCourseInput?.description || 'General course on this topic.'}
        4. **Level**: ${userCourseInput?.level}
        5. **Chapter Count**: Exactly ${userCourseInput?.noChapter} chapters.
        
        Rules:
        - Each chapter MUST have a "chapterName", "about" (1-2 sentences), and "duration" (e.g. "45 min").
        - The output MUST be a valid JSON object with: "courseName", "description", and a "chapters" array.
        - NO markdown formatting. NO conversational text.
        
        JSON Format:
        {
          "courseName": "...",
          "description": "...",
          "chapters": [
            { "chapterName": "...", "about": "...", "duration": "..." }
          ]
        }
      `;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'AI Generation failed');
      }

      const data = await res.json();
      let cleanJson = data.text || '';
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();

      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }

      const courseLayout = JSON.parse(cleanJson);
      const courseId = uuid4();

      const saveRes = await fetch('/api/create-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId,
          name: courseLayout.courseName || userCourseInput.topic,
          catagory: userCourseInput.catagory,
          level: userCourseInput.level,
          includeVideo: userCourseInput.displayVid,
          courseOutput: courseLayout,
          createdBy: userDetail?.email,
          userName: userDetail?.name,
          userProfileImage: userDetail?.imageUrl,
        }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        throw new Error(errorData.error || 'Failed to save course');
      }

      clearInterval(progressInterval);
      setProgress(100);
      toast.success('Course generated successfully!');
      router.replace('/create-course/' + courseId);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to generate course');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className='min-h-screen px-4 py-8 md:px-12 lg:px-28'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-3xl font-bold text-primary'>Create a Course</h2>
        <div className='flex items-center mt-6 space-x-4 md:space-x-6'>
          {Step.map((item, index) => (
            <div key={item.id} className='flex items-center'>
              <div className='flex flex-col items-center'>
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full text-foreground transition-all duration-300 ${activeIndex >= index ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {item.icon}
                </div>
                <span className='mt-2 text-sm font-medium text-center hidden md:block'>
                  {item.name}
                </span>
              </div>
              {index < Step.length - 1 && (
                <div
                  className={`w-10 md:w-16 h-1 mx-2 rounded-full transition-colors duration-300 ${activeIndex > index ? 'bg-primary' : 'bg-muted'
                    }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='p-0 md:p-0'>
        {activeIndex === 0 ? (
          <Catagory />
        ) : activeIndex === 1 ? (
          <TopicDesc />
        ) : (
          <Options />
        )}

        <div className="flex justify-between mt-10">
          <div className="flex w-full justify-between">
            {activeIndex > 0 && (
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border cursor-pointer border-primary text-primary hover:bg-primary/10 transition"
                onClick={() => setActiveIndex(activeIndex - 1)}
              >
                ⬅ Previous
              </Button>
            )}

            <div className="flex-1"></div>

            {activeIndex < 2 ? (
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border cursor-pointer border-primary text-primary hover:bg-primary/10 transition"
                disabled={check()}
                onClick={() => setActiveIndex(activeIndex + 1)}
              >
                Next ➡
              </Button>
            ) : (
              <Button
                className="px-6 py-2 rounded-xl cursor-pointer bg-primary hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30 transition"
                disabled={check() || loading}
                onClick={GenerateCourseLayout}
              >
                {loading ? 'Generating...' : '🚀 Generate Course'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <LoadingDialog loading={loading} progress={progress} />
    </div>
  );
}

export default CreateCourse;
