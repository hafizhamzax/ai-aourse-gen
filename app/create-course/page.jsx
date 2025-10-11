'use client';

import { Button } from '@/components/ui/button';
import React, { useContext, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Catagory from './_components/Catagory';
import TopicDesc from './_components/TopicDesc';
import Options from './_components/Options';
import { UserInputContext } from '../_context/UserInputContext';
import uuid4 from 'uuid4';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { FaTags, FaRegListAlt, FaSlidersH } from 'react-icons/fa';

function CreateCourse() {
  const { userCourseInput } = useContext(UserInputContext);
  const { user } = useUser();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

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
        !userCourseInput.duration ||
        !userCourseInput.noChapter)
    ) {
      return true;
    }

    return false;
  };

  const GenerateCourseLayout = async () => {
    setLoading(true);

    const ai = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });

    const config = { responseMimeType: 'application/json' };
    const model = 'gemini-2.5-flash';

    const prompt = 'Generate A Course Tutorial with fields Course Name, Description, Chapter Name, About, Duration:';
    const userPrompt = `Category: ${userCourseInput.catagory}, Topic: ${userCourseInput.topic}, Level: ${userCourseInput.level}, Duration: ${userCourseInput.duration}, NoOf Chapters: ${userCourseInput.noChapter}, in JSON format`;
    const contents = [{ role: 'user', parts: [{ text: prompt + userPrompt }] }];

    try {
      const response = await ai.models.generateContentStream({ model, config, contents });
      let resultText = '';
      for await (const chunk of response) resultText += chunk.text;
      const parsed = JSON.parse(resultText);
      SaveCourseLayoutInDb(parsed);
    } catch (error) {
      if (
        error?.message?.includes('overloaded') ||
        error?.message?.includes('UNAVAILABLE') ||
        error?.message?.includes('503')
      ) {
        alert('The AI model is overloaded. Please try again shortly.');
      } else {
        alert('An error occurred while generating the course. Please try again.');
      }
      console.error('Error generating course layout:', error);
    }

    setLoading(false);
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
        <h2 className='text-3xl font-bold text-purple-600'>Create a Course</h2>
        <div className='flex items-center mt-6 space-x-4 md:space-x-6'>
          {Step.map((item, index) => (
            <div key={item.id} className='flex items-center'>
              <div className='flex flex-col items-center'>
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full text-white transition-colors duration-300 ${
                    activeIndex >= index ? 'bg-purple-500' : 'bg-gray-300'
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
                  className={`w-10 md:w-16 h-1 mx-2 rounded-full transition-colors duration-300 ${
                    activeIndex > index ? 'bg-purple-500' : 'bg-gray-300'
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
                className="px-6 py-2 rounded-xl border cursor-pointer border-purple-400 text-purple-600 hover:bg-purple-50 transition"
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
                className="px-6 py-2 rounded-xl border cursor-pointer border-purple-400 text-purple-600 hover:bg-purple-50 transition"
                onClick={() => setActiveIndex(0)}
              >
                ⬅ Previous
              </Button>
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border cursor-pointer border-purple-400 text-purple-600 hover:bg-purple-50 transition"
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
                className="px-6 py-2 rounded-xl border cursor-pointer border-purple-400 text-purple-600 hover:bg-purple-50 transition"
                onClick={() => setActiveIndex(1)}
              >
                ⬅ Previous
              </Button>
              <Button
                className="px-6 py-2 rounded-xl cursor-pointer bg-purple-600 hover:bg-purple-700 text-white transition"
                disabled={check() || loading}
                onClick={GenerateCourseLayout}
              >
                {loading ? 'Generating...' : '🚀 Generate Course'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;
