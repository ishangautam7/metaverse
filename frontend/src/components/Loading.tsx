"use client";

export const Loading = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-neutral-950 text-white">
      <div className="text-center">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-neutral-800 rounded-full"></div>
          <div className="absolute inset-0 w-10 h-10 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    </div>
  );
};
