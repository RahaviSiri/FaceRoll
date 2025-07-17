import React, { useState } from "react";
import axios from "axios";

const MarkAttendance = () => {
  const [className, setClassName] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!className || !image) {
      setIsSuccess(false);
      setMessage("Please select class and upload an image.");
      clearMessageAfterDelay();
      return;
    }

    const formData = new FormData();
    formData.append("className", className);
    formData.append("image", image);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/teacher/mark-attendance`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsSuccess(true);
      setMessage("Attendance marked successfully!");
      setClassName("");
      setImage(null);
    } catch (error) {
      setIsSuccess(false);
      console.error("Error marking attendance:", error);
      setMessage("Failed to mark attendance.");
    }
    clearMessageAfterDelay();
  };

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Mark Attendance</h2>
        {message && (
          <div
            className={`mb-4 text-center text-sm font-medium p-2 rounded ${
              isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Class Name</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              placeholder="Enter class name"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white py-2 px-4 rounded hover:bg-black/80 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarkAttendance;
