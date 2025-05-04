'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlay, FaHeadphones, FaMusic, FaMicrophone, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import FeatureCard from '@/components/FeatureCard';

export default function Home() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      {/* Main Content */}
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold mb-6"
              >
                <span>Discover Your </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400">Perfect Beat</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl text-gray-300 mb-8"
              >
                Stream unlimited music, create playlists and discover new artists. Your personal soundtrack starts here.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
              >
                {!user ? (
                  <>
                    <Link href="/signup" className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center">
                      <FaHeadphones className="mr-2" /> Get Started Free
                    </Link>
                    <Link href="/login" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center">
                      <FaPlay className="mr-2" /> Already a member?
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/explore" className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center">
                      <FaHeadphones className="mr-2" /> Explore Music
                    </Link>
                    <Link href="/library" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center">
                      <FaPlay className="mr-2" /> My Library
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-800/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-8">
                      <FaMusic className="text-7xl md:text-8xl text-pink-500" />
                    </div>
                  </div>
                  {/* Add vinyl record or album art visuals here */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500 rounded-full opacity-10 blur-xl"></div>
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500 rounded-full opacity-10 blur-xl"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400">GoMusic</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Discover a world of music at your fingertips with features designed for the ultimate listening experience.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<FaHeadphones className="text-3xl text-pink-500" />}
                title="Premium Sound Quality"
                description="Experience crystal clear audio with high-definition streaming that brings out every detail in your music."
                delay={0.1}
                isVisible={isVisible}
              />
              <FeatureCard 
                icon={<FaHeart className="text-3xl text-pink-500" />}
                title="Personalized Playlists"
                description="Discover new music tailored to your taste based on your listening habits and preferences."
                delay={0.2}
                isVisible={isVisible}
              />
              <FeatureCard 
                icon={<FaMicrophone className="text-3xl text-pink-500" />}
                title="Artist Spotlights"
                description="Connect with your favorite artists through exclusive content, behind-the-scenes, and more."
                delay={0.3}
                isVisible={isVisible}
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 md:p-12 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to start your musical journey?</h2>
                  <p className="text-gray-400">Join thousands of music lovers who have already discovered GoMusic.</p>
                </div>
                <div className="flex-shrink-0">
                  <Link href={user ? "/explore" : "/signup"} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center">
                    {user ? "Explore Now" : "Sign Up Free"}
                    <FaPlay className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
