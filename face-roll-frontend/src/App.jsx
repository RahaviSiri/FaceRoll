import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import MarkAttendence from './pages/MarkAttendence';
import AddStudent from './pages/AddStudent';
import StudentAttendence from './pages/StudentAttendence';
import Login from './pages/Login';
import DownloadAttendance from './pages/DownloadPdf';
import { AppContext } from './context/appContext.jsx';

const App = () => {
  const { token } = useContext(AppContext);

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
            <Route path="/download-attendence" element={<DownloadAttendance />} />
          </Routes>
        </main>
      </div>
    ) : (
      <Login />
    )
  );
};

export default App;
