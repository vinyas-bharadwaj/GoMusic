'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaHome, FaMusic, FaHeart, FaUserAlt, FaBars, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaUpload } from 'react-icons/fa';
import { RiPlayListFill } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io';
import { useAuth } from '@/context/AuthContext';
import NavLink from './NavLink';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutUser } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logoutUser();
  };

  return (
    <nav className="fixed p-1 top-0 w-full z-50 bg-black shadow-lg border-b border-pink-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400">Go</span>
              <span className="text-3xl font-bold text-white">Music</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-5">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-pink-500" />
              </div>
              <input
                type="text"
                placeholder="Search for songs, artists, albums..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-full bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {/* Common Links for All Users */}
              <NavLink href="/" icon={<FaHome />} text="Home" />
              <NavLink href="/song/explore" icon={<FaMusic />} text="Explore" />
              
              {/* Authenticated User Links */}
              {user ? (
                <>
                  <NavLink href="/library" icon={<RiPlayListFill />} text="Library" />
                  <NavLink href="/song/upload" icon={<FaUpload />} text="Upload" />
                  <NavLink href="/profile" icon={<FaUserAlt />} text="Profile" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-pink-400"
                  >
                    <span className="mr-1.5 text-pink-400"><FaSignOutAlt /></span>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Guest Links */}
                  <NavLink href="/login" icon={<FaSignInAlt />} text="Login" />
                  <NavLink href="/signup" icon={<FaUserPlus />} text="Sign Up" />
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-pink-500 hover:text-pink-400 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <IoMdClose className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};




export default Navbar;