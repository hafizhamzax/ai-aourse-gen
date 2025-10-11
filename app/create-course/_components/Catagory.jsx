import { UserInputContext } from '@/app/_context/UserInputContext';
import catagoryList from '@/app/shared/catagoryList'; // Corrected spelling to 'categoryList'
import Image from 'next/image';
import React, { useContext } from 'react';
// Assuming `User` icon from 'lucide-react' isn't directly used in the current render,
// so it's omitted for clarity unless it has a different purpose elsewhere.

function Catagory() { // Corrected spelling to 'Category'
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);

  const handleCatagoryChange = (Catagory) => {
    setUserCourseInput(prev => ({
      ...prev,
      catagory: Catagory,
    }));
  };

  return (
    <div className='px-2 md:px-8 lg:px-7 py-3 '>
      <h2 className='text-3xl font-extrabold text-gray-900 mb-8 text-center'>
        Select a Category
      </h2>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 ml-55  '>
        {catagoryList.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-3 border-2 rounded-2xl cursor-pointer
                       transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-lg
                       ${userCourseInput?.catagory === item.name
                         ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-md'
                         : 'border-gray-200 bg-white text-gray-700 hover:border-purple-400'
                       }
                       focus:outline-none focus:ring-4 focus:ring-purple-200 focus:ring-opacity-75`}
            onClick={() => handleCatagoryChange(item.name)}
          >
            <div className='mb-4'>
              <Image
  src={item.icon}
  alt={item.name}
  width={48}
  height={48}
  className='object-contain'
/>


            </div>
            <p className='text-lg font-semibold text-center '>{item.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Catagory;