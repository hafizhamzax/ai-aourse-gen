'use client';

import { Button } from '@/components/ui/button';
import React, { useContext, useState } from 'react';

import { toast } from 'react-hot-toast'; // Assuming toast is available or use alert
import Catagory from './_components/Catagory';
import TopicDesc from './_components/TopicDesc';
import Options from './_components/Options';
import LoadingDialog from './_components/LoadingDialog';
import { UserInputContext } from '../_context/UserInputContext';
import uuid4 from 'uuid4';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { FaTags, FaRegListAlt, FaSlidersH } from 'react-icons/fa';
import { useUserDetail } from '../_context/UserDetailContext';

function CreateCourse() {
  const { userCourseInput } = useContext(UserInputContext);
  const { user } = useUser();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
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
    { id: 1, name: 'Category', icon: <FaTags /> },
    { id: 2, name: 'Topic & Desc', icon: <FaRegListAlt /> },
    { id: 3, name: 'Options', icon: <FaSlidersH /> },
  ];

  const check = () => {
    if (!userCourseInput) return true;

    if (
      activeIndex === 0 &&
      (!userCourseInput.catagory || userCourseInput.catagory.trim() === '')
    ) {
      return true;
    }

    if (
      activeIndex === 1 &&
      (!userCourseInput.topic || userCourseInput.topic.trim() === '')
    ) {
      return true;
    }

    if (
      activeIndex === 2 &&
      (!userCourseInput.level ||
        !userCourseInput.displayVid ||
        !userCourseInput.noChapter)
    ) {
      return true;
    }

    return false;
  };

  const GenerateCourseLayout = async () => {
    setLoading(true);

    try {
      const prompt = 'Generate a course layout in strict JSON with fields: CourseName, Description, catagory, level, and Chapters.';
      const userPrompt = ` Category: ${userCourseInput.catagory}; Topic: ${userCourseInput.topic}; Level: ${userCourseInput.level}; NoOfChapters: ${userCourseInput.noChapter}. Return JSON of the form {"CourseName": "...", "Description": "...", "catagory": "...", "level": "...", "Chapters": [{"name": "Chapter 1", "about": "summary"}, ...]}.  Ensure the response is valid JSON and nothing else.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt + userPrompt }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || response.statusText);
      }

      const data = await response.json();
      let resultText = data.text;

      if (!resultText) {
        throw new Error("AI model failed to generate content.");
      }

      // Clean markdown code blocks if present
      const cleanText = resultText.replace(/```json/g, '').replace(/```/g, '');
      const parsed = JSON.parse(cleanText);

      await SaveCourseLayoutInDb(parsed);
    } catch (error) {
      console.error('Error generating course:', error);
      toast.error('Error generating course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SaveCourseLayoutInDb = async (courseLayout) => {
    setLoading(true);

    if (!userCourseInput.catagory) {
      alert('Please select a category before saving.');
      setLoading(false);
      return;
    }

    const id = uuid4();

    const res = await fetch('/api/create-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: id,
        topic: userCourseInput.topic,
        level: userCourseInput.level,
        catagory: userCourseInput.catagory,
        courseOutput: courseLayout,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        userProfileImage: user?.imageUrl,
      }),
    });

    const data = await res.json();

    if (data.success) {
      router.replace('/create-course/' + id);
    } else {
      alert('Error saving course: ' + (data.error || 'Unknown error'));
      console.error('Error saving course:', data.error);
    }

    setLoading(false);
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
        {activeIndex === 0 ? <Catagory /> : activeIndex === 1 ? <TopicDesc /> : <Options />}

        {/* ✅ Navigation Buttons */}
        <div className="flex justify-between mt-10">
          {activeIndex === 0 && (
            <div className="flex justify-end w-full">
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border cursor-pointer border-primary text-primary hover:bg-primary/10 transition"
                disabled={check()}
                onClick={() => setActiveIndex(1)}
              >
                Next ➡
              </Button>
            </div>
          )}

          {activeIndex === 1 && (
            <>
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border cursor-pointer border-primary text-primary hover:bg-primary/10 transition"
                onClick={() => setActiveIndex(0)}
              >
                ⬅ Previous
              </Button>
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border cursor-pointer border-primary text-primary hover:bg-primary/10 transition"
                disabled={check()}
                onClick={() => setActiveIndex(2)}
              >
                Next ➡
              </Button>
            </>
          )}

          {activeIndex === 2 && (
            <>
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border cursor-pointer border-primary text-primary hover:bg-primary/10 transition"
                onClick={() => setActiveIndex(1)}
              >
                ⬅ Previous
              </Button>
              <Button
                className="px-6 py-2 rounded-xl cursor-pointer bg-primary hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30 transition"
                disabled={check() || loading}
                onClick={GenerateCourseLayout}
              >
                {loading ? 'Generating...' : '🚀 Generate Course'}
              </Button>
            </>
          )}
        </div>
      </div>
      <LoadingDialog loading={loading} />
    </div>
  );
}

export default CreateCourse;
