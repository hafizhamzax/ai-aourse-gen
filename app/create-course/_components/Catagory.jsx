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

  // Check if current selected category is in the static list
  const isCustomCategory = userCourseInput?.catagory && !catagoryList.some(c => c.name === userCourseInput.catagory);

  return (
    <div className='px-4 md:px-20 py-10'>
      <h2 className='text-4xl font-extrabold text-foreground mb-12 text-center tracking-tight'>
        Choose your Knowledge Domain
      </h2>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8'>
        {/* Render Static List */}
        {catagoryList.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-6 border rounded-3xl cursor-pointer
                       transition-all duration-300 ease-out
                       hover:scale-105 hover:shadow-xl hover:shadow-primary/10
                       ${userCourseInput?.catagory === item.name
                ? 'border-primary bg-primary/5 text-primary shadow-md ring-1 ring-primary'
                : 'border-border bg-card text-foreground hover:border-primary/50'
              }
                       focus:outline-none focus:ring-4 focus:ring-primary/20`}
            onClick={() => handleCatagoryChange(item.name)}
          >
            <div className='mb-4 transition-transform duration-300 group-hover:scale-110'>
              <div className='mb-4 text-4xl'>
                {item.icon}
              </div>
            </div>
            <p className='text-lg font-bold text-center tracking-wide'>{item.name}</p>
          </button>
        ))}

        {/* Render Custom Auto-Detected Category if it exists and isn't in the list */}
        {isCustomCategory && (
          <button
            className={`flex flex-col items-center justify-center p-6 border rounded-3xl cursor-pointer
                      transition-all duration-300 ease-out
                      hover:scale-105 hover:shadow-xl hover:shadow-primary/10
                      border-primary bg-primary/5 text-primary shadow-md ring-1 ring-primary
                      focus:outline-none focus:ring-4 focus:ring-primary/20`}
          >
            <div className='mb-4 text-5xl animate-pulse'>
              ✨ {/* Fallback icon for custom AI categories */}
            </div>
            <p className='text-lg font-bold text-center tracking-wide'>{userCourseInput.catagory}</p>
          </button>
        )}
      </div>
    </div>
  );
}

export default Catagory;