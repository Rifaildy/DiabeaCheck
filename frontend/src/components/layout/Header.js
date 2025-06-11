"use client"

import { useState, useEffect, useRef } from "react"; // Added useRef for dropdown
import { Link, useLocation } from "react-router-dom";
import { HeartPulse, Menu, X, User, ChevronDown } from "lucide-react"; // Added ChevronDown for dropdown indicator

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // State for user dropdown
  const location = useLocation();
  const [user, setUser] = useState(null);
  const userDropdownRef = useRef(null); // Ref for user dropdown

  useEffect(() => {
    // These are placeholder functions. In a real application, you would import them
    // from a dedicated authentication utility file (e.g., '../../utils/auth').
    const isAuthenticated = () => localStorage.getItem('token') !== null;
    const getUserFromToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode JWT token payload (for demonstration, not for production security)
          const payload = JSON.parse(atob(token.split('.')[1]));
          return { firstName: payload.firstName || '' }; // Assuming firstName is in payload, changed fallback from 'User' to ''
        } catch (e) {
          console.error("Error decoding token:", e);
          return null;
        }
      }
      return null;
    };

    if (isAuthenticated()) {
      const userData = getUserFromToken();
      setUser(userData);
    }
  }, [location]);

  // Effect to close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Placeholder logout function
    const logout = () => {
      localStorage.removeItem('token');
      // Additional cleanup like redirecting to login page could go here
    };
    logout();
    setUser(null);
    setIsUserDropdownOpen(false); // Close dropdown on logout
    // You might want to use `navigate('/login');` here if using React Router v6
  };

  const navigation = [
    { name: "Beranda", href: "/", current: location.pathname === "/" },
    {
      name: "Prediksi",
      href: "/prediction",
      current: location.pathname === "/prediction",
    },
    {
      name: "Tentang",
      href: "/about",
      current: location.pathname === "/about",
    },
  ];

  // Placeholder for isAuthenticated function for demo purposes if not provided externally
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <HeartPulse className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DiabeaCheck</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Authentication Section for Desktop */}
            {isAuthenticated() && user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={isUserDropdownOpen ? "true" : "false"}
                >
                  <User className="h-5 w-5 text-gray-600" />
                  <span>{user.firstName || ''}</span> {/* Display user's first name, removed 'User' fallback */}
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Authentication Section for Mobile - simplified for mobile layout */}
              {isAuthenticated() && user ? (
                <div className="flex flex-col space-y-2 mt-2 border-t border-gray-200 pt-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <span>{user.firstName || ''} Profile</span> {/* Removed 'User' fallback */}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false); // Close mobile menu on logout
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 mt-2 border-t border-gray-200 pt-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
