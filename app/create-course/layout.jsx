'use client';

import React, { useState } from 'react';
import { UserInputContext } from '../_context/UserInputContext';
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
