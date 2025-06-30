import React from 'react'
import NavBar from './components/NavBar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MarkAttendence from './pages/MarkAttendence'
import AddStudent from './pages/AddStudent'

const App = () => {
  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mark-attendance" element={<MarkAttendence />} />
        <Route path="/add-student" element={<AddStudent />} />
      </Routes>
    </div>
  )
}

export default App