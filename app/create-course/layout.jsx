// filepath: c:\Users\Hamza\Documents\Computer science\Web\Projects\ai-course-gen\app\create-course\layout.jsx
"use client"
import React, { useState } from 'react';
import { UserInputContext } from '../_context/UserInputContext';
import Header from '../_components/Header';
import Header2 from '../dashboard/_components/Header2';

function CreateCourseLayout({ children }) {
  const [userCourseInput, setUserCourseInput] = useState([]);

  return (
    <div>
      <UserInputContext.Provider value={{ userCourseInput, setUserCourseInput }}>
        <Header2 />
        {children}
      </UserInputContext.Provider>
    </div>
  );
}

export default CreateCourseLayout;