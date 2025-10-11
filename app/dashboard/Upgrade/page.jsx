'use client';
import React, { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const UpgradePage = () => {
  useEffect(() => {
    alert('Upgrade features are coming soon!');
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-8 mt-10">
      <ShieldCheck className="text-purple-600 mb-4" size={48} />
      <h1 className="text-3xl font-bold text-purple-700 mb-2">Upgrade Coming Soon!</h1>
      <p className="text-gray-600 text-lg mb-6 text-center">
        We're working hard to bring you premium features.<br />
        Stay tuned for exciting updates!
      </p>
      <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold">
        Thank you for your interest!
      </span>
    </div>
  );
};

export default UpgradePage;