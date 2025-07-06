"use client";

import { useEffect, useState } from "react";

export const Loading = () => {
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationDone(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (animationDone) {
    return null;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:50px_50px] opacity-5"></div>
      </div>

      {/* Loading content */}
      <div className="text-center animate-fade-in relative z-10 flex flex-col items-center">
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-t-purple-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 w-16 h-16 border-2 border-white/10 rounded-full"></div>
        </div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
          Loading
        </h2>
        <p className="text-gray-400 animate-pulse">Preparing your virtual experience...</p>

        <div className="flex justify-center gap-2 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
};
