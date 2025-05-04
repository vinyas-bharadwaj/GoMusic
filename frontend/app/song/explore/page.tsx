'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlay, FaSearch, FaMusic, FaHeart, FaRegHeart, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface Song {
  ID: number;
  Title: string;
  Artist: string;
  Album: string;
  Genre: string;
  Duration: number;
  FilePath: string;
  CreatedAt: string;
}

export default function ExplorePage() {
  const { authTokens } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState<{[key: number]: boolean}>({});
  const [isVisible, setIsVisible] = useState(false);

  // Animation when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch songs data
  useEffect(() => {
    const fetchSongs = async () => {
      if (!authTokens) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/songs`,
          {
            headers: {
              'Authorization': `Bearer ${authTokens.token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }

        const data = await response.json();
        setSongs(data);
        setFilteredSongs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load songs');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [authTokens, router]);

  // Handle search and filtering
  useEffect(() => {
    if (!songs.length) return;

    let results = [...songs];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(song => 
        song.Title.toLowerCase().includes(query) || 
        song.Artist.toLowerCase().includes(query) || 
        song.Album.toLowerCase().includes(query) ||
        song.Genre.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'favorites') {
        results = results.filter(song => favorites[song.ID]);
      } else {
        // Filter by genre
        results = results.filter(song => 
          song.Genre.toLowerCase() === activeFilter.toLowerCase()
        );
      }
    }
    
    setFilteredSongs(results);
  }, [searchQuery, activeFilter, songs, favorites]);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle favorite status for a song
  const toggleFavorite = async (songId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!authTokens) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/songs/${songId}/favorite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authTokens.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFavorites(prev => ({
          ...prev,
          [songId]: data.isFavourited
        }));
      }
    } catch (err) {
      console.error('Error toggling favorite status:', err);
    }
  };

  // Get unique genres for filter options
  const genres = [...new Set(songs.filter(song => song.Genre).map(song => song.Genre))];

  // Generate skeleton loaders during loading state
  const renderSkeletons = () => {
    return Array(8).fill(0).map((_, index) => (
      <div key={index} className="bg-gray-900 rounded-lg p-4 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-800 rounded-md mr-4"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-800 rounded w-1/4"></div>
          <div className="h-8 w-8 bg-gray-800 rounded-full"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400">Music</span>
              </h1>
              <p className="text-gray-400">Discover new songs and artists from our collection</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by title, artist, album or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 w-full pl-10 pr-4 py-3 rounded-lg border border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <div className="relative">
              <button 
                className="bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg border border-gray-800 flex items-center"
                onClick={() => {
                  const dropdown = document.getElementById('filter-dropdown');
                  dropdown?.classList.toggle('hidden');
                }}
              >
                <FaFilter className="mr-2 text-pink-500" />
                Filter by {activeFilter === 'all' ? 'All' : activeFilter === 'favorites' ? 'Favorites' : activeFilter}
              </button>
              
              <div id="filter-dropdown" className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-gray-900 border border-gray-800 hidden">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveFilter('all');
                      document.getElementById('filter-dropdown')?.classList.add('hidden');
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${activeFilter === 'all' ? 'bg-gray-800 text-pink-500' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    All Songs
                  </button>
                  <button
                    onClick={() => {
                      setActiveFilter('favorites');
                      document.getElementById('filter-dropdown')?.classList.add('hidden');
                    }}
                    className={`block px-4 py-2 text-sm w-full text-left ${activeFilter === 'favorites' ? 'bg-gray-800 text-pink-500' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Favorites
                  </button>
                  
                  {genres.length > 0 && (
                    <div className="border-t border-gray-800 mt-1 pt-1">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => {
                            setActiveFilter(genre);
                            document.getElementById('filter-dropdown')?.classList.add('hidden');
                          }}
                          className={`block px-4 py-2 text-sm w-full text-left ${activeFilter === genre ? 'bg-gray-800 text-pink-500' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderSkeletons()}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-10 text-center">
              <FaMusic className="text-gray-700 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No songs found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? `No results for "${searchQuery}"` : 'No songs available in this category'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-6 rounded-lg inline-flex items-center"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredSongs.map((song, index) => (
                <motion.div
                  key={song.ID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/song/${song.ID}`} className="block">
                    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-pink-500/50 transition-all duration-300 h-full flex flex-col">
                      <div className="p-5 flex-grow">
                        <div className="flex items-start mb-4">
                          <div className="bg-gray-800 rounded-md h-16 w-16 flex items-center justify-center flex-shrink-0 mr-4">
                            <FaMusic className="text-pink-500 text-xl" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1 line-clamp-1">{song.Title}</h3>
                            <p className="text-gray-400 line-clamp-1">{song.Artist}</p>
                            {song.Album && <p className="text-gray-500 text-sm mt-1 line-clamp-1">Album: {song.Album}</p>}
                          </div>
                        </div>
                        
                        {song.Genre && (
                          <div className="mb-3">
                            <span className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                              {song.Genre}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-800/50 px-5 py-3 flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          {formatDuration(song.Duration)}
                        </span>
                        
                        <div className="flex space-x-3">
                          <button 
                            onClick={(e) => toggleFavorite(song.ID, e)}
                            className="text-gray-400 hover:text-pink-500 transition-colors"
                          >
                            {favorites[song.ID] ? (
                              <FaHeart className="text-pink-500" />
                            ) : (
                              <FaRegHeart />
                            )}
                          </button>
                          
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center">
                            <FaPlay className="text-white text-xs ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Upload CTA */}
          <div className="mt-12 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Share your music with the world</h3>
                <p className="text-gray-400">Upload your own tracks and let other users discover your sound.</p>
              </div>
              <div>
                <Link 
                  href="/song/upload" 
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 inline-block"
                >
                  Upload a Song
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}