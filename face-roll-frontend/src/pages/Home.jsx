import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full p-6">
      {/* Left Side (Text Content) */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-6">
        <div className="text-center max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 typing">
            Welcome to FaceRoll
          </h1>
          <p className="text-base md:text-xl">
            "Transforming classrooms with AI-powered attendance — one face at a time."
          </p>
        </div>
      </div>

      {/* Right Side (Image) */}
      <div className="w-full md:w-1/2 h-auto">
        <img
          src="/Backround.jpg"
          alt="Background"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};

export default Home;
