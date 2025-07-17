import React, { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/appContext.jsx';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { token,setToken } = useContext(AppContext);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Mark Attendance', path: '/mark-attendance' },
    { name: 'Add Student', path: '/add-student' },
    { name: 'Student Attendance', path: '/student-attendance' },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("authToken");
      setToken(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-black/80 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">Face Roll</Link>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'font-semibold border-b-2 border-white'
                  : 'hover:text-gray-200'
              }
            >
              {item.name}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="ml-4 px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-3 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="block py-2 border-b border-white"
            >
              {item.name}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full text-left py-2 text-red-400 border-t border-white"
          >
            Logout
          </button>
        </div>
      )} 
    </nav>
  );
};

export default NavBar;
