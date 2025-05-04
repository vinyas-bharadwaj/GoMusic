'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaUser, FaLock, FaMusic, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const { signupUser, isLoading, error, setError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="relative flex min-h-screen overflow-hidden pt-20">
      {/* Left side - Form */}
      <div className="relative z-10 w-full max-w-md mx-auto my-8">
        <div className="bg-gray-900 shadow-xl rounded-lg p-8 border border-gray-800 bg-opacity-90">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center">
              <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400">Go</span>
              <span className="text-4xl font-bold text-white">Music</span>
            </Link>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={signupUser}>
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-pink-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-pink-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-pink-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-pink-500" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex justify-center items-center"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sign Up'}
              </button>
            </div>
            
            <div className="text-center text-gray-400">
              <p>Already have an account? <Link href="/login" className="text-pink-400 hover:text-pink-300 transition-colors">Log in</Link></p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Decorative music graphic (static version) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative z-10">
        <div className="relative z-10 text-center px-12">
          <div className="relative">
            <FaMusic className="text-pink-500 mx-auto mb-6 text-9xl" />
            <div className="absolute -inset-4 bg-pink-500 rounded-full blur-xl opacity-10"></div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Join GoMusic</h2>
          <p className="text-xl text-gray-300">Discover new music, create playlists, and enjoy your favorite tracks anytime.</p>
        </div>
      </div>
    </div>
  );
}