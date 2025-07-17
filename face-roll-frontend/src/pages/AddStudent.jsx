import React from 'react';
import axios from 'axios';

const AddStudent = () => {
  const [name, setName] = React.useState('');
  const [className, setClassName] = React.useState('');
  const [image, setImage] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !className || !image) {
      setIsSuccess(false);
      setMessage("Please fill in all fields and upload an image.");
      clearMessageAfterDelay();
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("className", className);
    formData.append("image", image);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/teacher/add-student`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setIsSuccess(true);
      setMessage("Student added successfully!");
      setName('');
      setClassName('');
      setImage(null);
    } catch (error) {
      setIsSuccess(false);
      console.error("Error adding student:", error);
      setMessage("Failed to add student.");
    }
    clearMessageAfterDelay();
  };

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Student</h2>

        {message && (
          <div className={`mb-4 text-center text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Student Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter student name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Class Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-400"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. Grade 10"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Upload Student Image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border border-gray-300 rounded-lg p-2"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-black/80 transition duration-200"
        >
          Add Student
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
