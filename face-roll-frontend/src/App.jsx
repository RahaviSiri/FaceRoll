import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import MarkAttendence from './pages/MarkAttendence'
import AddStudent from './pages/AddStudent'
import StudentAttendence from './pages/StudentAttendence'
import Login from './pages/Login' 

const App = () => {
  const token = localStorage.getItem("authToken");

  return (
    token ? (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mark-attendance" element={<MarkAttendence />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/student-attendance" element={<StudentAttendence />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    ) : (
      <Login />
    )
  )
}

export default App;
