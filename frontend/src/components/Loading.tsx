"use client";

import { useEffect, useState } from "react";

export const Loading = () => {
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setAnimationDone(true);
    }, 3000); // Timer to simulate loading state
    return () => clearTimeout(timer);
  }, []);

  if (animationDone) {
    return null; // If animation is done, stop showing the loading page
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-black text-white opacity-90">
      <div className="text-center animate-fade-in">
        {/* Spinner Circle */}
        <div className="w-16 h-16 border-4 border-t-4 border-white rounded-full animate-spin mx-auto mb-4"></div>
        {/* Loading Text */}
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
}
