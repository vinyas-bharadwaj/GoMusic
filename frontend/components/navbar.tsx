'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { FaSearch, FaHome, FaMusic, FaHeart, FaUserAlt, FaBars } from 'react-icons/fa';
import { RiPlayListFill } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io';

const Navbar = () => {
  const pathname = usePathname(); 
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`fixed p-1 top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black shadow-lg border-b border-pink-500' 
        : 'bg-black'
    }`}>
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
              <NavLink href="/" icon={<FaHome />} text="Home" />
              <NavLink href="/explore" icon={<FaMusic />} text="Explore" />
              <NavLink href="/library" icon={<RiPlayListFill />} text="Library" />
              <NavLink href="/favorites" icon={<FaHeart />} text="Favorites" />
              <NavLink href="/profile" icon={<FaUserAlt />} text="Profile"/>
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

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
}

// Desktop Navigation Link Component
const NavLink = ({ href, icon, text }: NavLinkProps) => (
  <Link 
    href={href}
    className='flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-pink-400'
  >
    <span className="mr-1.5 text-pink-400">{icon}</span>
    {text}
  </Link>
);

export default Navbar;