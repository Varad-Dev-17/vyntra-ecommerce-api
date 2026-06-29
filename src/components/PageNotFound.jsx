import React from "react";

const PathNotFound = () => {
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-[#fcf8ff]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#4648d4]">404</h1>
          <p className="text-2xl mt-4">Page Not Found</p>
          <p className="mt-2 text-gray-600">
            The page you are looking for does not exist.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PathNotFound;
