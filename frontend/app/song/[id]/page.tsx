'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaHeart, FaStepBackward, FaStepForward, FaDownload, FaRegHeart, FaMusic } from 'react-icons/fa';
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

export default function SongPage() {
  const { id } = useParams();
  const router = useRouter();
  const { authTokens, user } = useAuth();
  
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Fetch song data
  useEffect(() => {
    const fetchSong = async () => {
      if (!authTokens) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/songs/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${authTokens.token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch song');
        }

        const data = await response.json();
        setSong(data);
        
        // Check favorite status
        await checkFavoriteStatus();
      } catch (err) {
        setError('Could not load the song. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSong();
  }, [id, authTokens, router]);

  // Add this new effect to fetch the audio file with authorization
  useEffect(() => {
    // Create a function to fetch the audio with auth
    const fetchAudioWithAuth = async () => {
      if (!song || !authTokens) return;
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/songs/${song.ID}/play`,
          {
            headers: {
              'Authorization': `Bearer ${authTokens.token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to load audio file');
        }
        
        // Convert the response to a blob and create an object URL
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (err) {
        console.error('Error loading audio:', err);
        setError('Could not load the audio file. Please try again later.');
      }
    };
    
    if (song && authTokens) {
      fetchAudioWithAuth();
    }
    
    // Cleanup function to revoke object URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [song, authTokens]);

  // Check if song is in user's favorites
  const checkFavoriteStatus = async () => {
    if (!authTokens || !id) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/favorites/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${authTokens.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  // Handle toggling favorite status
  const toggleFavorite = async () => {
    if (!authTokens || !id || isToggling) return;

    setIsToggling(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/songs/${id}/favorite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authTokens.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavourited);
      }
    } catch (err) {
      console.error('Error toggling favorite status:', err);
    } finally {
      setIsToggling(false);
    }
  };

  // Audio player event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedData = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 0.75;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time from seconds to MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="relative z-10 pt-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="bg-black min-h-screen">
        <div className="relative z-10 pt-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <h2 className="text-2xl text-white mb-4">Song not found</h2>
              <p className="text-gray-400 mb-6">{error || "We couldn't find the song you're looking for."}</p>
              <Link 
                href="/library" 
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300"
              >
                Back to Library
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        
        {/* Static glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-700 rounded-full opacity-5 blur-3xl translate-x-1/4 translate-y-1/4"></div>
        
        {/* Sound wave effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-24 flex items-center justify-center opacity-10">
          <div className="flex items-center space-x-1">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-pink-500 rounded-full animate-soundwave"
                style={{ 
                  height: `${Math.random() * 70 + 10}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${Math.random() * 1 + 0.5}s` 
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={audioUrl || ''}  // Use the blob URL instead of direct API path
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          setError('Failed to play this song. Please try again later.');
        }}
        className="hidden"
      />

      {/* Main Content */}
      <div className="relative z-10 pt-24 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Song Info Section */}
          <div className="bg-gray-900 rounded-lg p-6 md:p-8 shadow-lg border border-gray-800">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Album Art (placeholder) */}
              <div className="w-40 h-40 md:w-64 md:h-64 flex-shrink-0 bg-gray-800 rounded-lg shadow-md mb-6 md:mb-0 md:mr-8 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <FaMusic className="text-6xl text-gray-600" />
                </div>
              </div>
              
              {/* Song Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{song.Title}</h1>
                  <button 
                    onClick={toggleFavorite}
                    disabled={isToggling}
                    className="hidden md:block text-2xl"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite ? (
                      <FaHeart className="text-pink-500 hover:text-pink-400 transition-colors" />
                    ) : (
                      <FaRegHeart className="text-gray-400 hover:text-pink-500 transition-colors" />
                    )}
                  </button>
                </div>
                <h2 className="text-xl text-gray-300 mb-4">{song.Artist}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
                  {song.Album && (
                    <div>
                      <span className="text-gray-400 text-sm">Album</span>
                      <p className="text-white">{song.Album}</p>
                    </div>
                  )}
                  
                  {song.Genre && (
                    <div>
                      <span className="text-gray-400 text-sm">Genre</span>
                      <p className="text-white">{song.Genre}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-400 text-sm">Duration</span>
                    <p className="text-white">{formatTime(duration)}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Added on</span>
                    <p className="text-white">{new Date(song.CreatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={togglePlayPause}
                    className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <>
                        <FaPause className="mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <FaPlay className="mr-2" /> Play
                      </>
                    )}
                  </button>
                  
                  <Link 
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/songs/${song.ID}/play`}
                    download={`${song.Title} - ${song.Artist}.mp3`}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDownload className="mr-2" /> Download
                  </Link>
                  
                  {/* Mobile Favorite Button */}
                  <button 
                    onClick={toggleFavorite}
                    disabled={isToggling}
                    className="md:hidden bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center"
                  >
                    {isFavorite ? (
                      <>
                        <FaHeart className="mr-2 text-pink-500" /> Favorited
                      </>
                    ) : (
                      <>
                        <FaRegHeart className="mr-2" /> Add to Favorites
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Player Controls */}
            <div className="mt-8 bg-gray-800 p-4 rounded-lg">
              {/* Progress Bar */}
              <div 
                ref={progressBarRef}
                className="h-2 bg-gray-700 rounded-full cursor-pointer mb-4"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Seek Handle */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                
                {/* Center Controls */}
                <div className="flex items-center space-x-6">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <FaStepBackward />
                  </button>
                  
                  <button 
                    className="bg-pink-500 hover:bg-pink-600 rounded-full w-12 h-12 flex items-center justify-center text-white shadow-lg transition-colors"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                  </button>
                  
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <FaStepForward />
                  </button>
                </div>
                
                {/* Volume Controls */}
                <div className="flex items-center space-x-2">
                  <button 
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={toggleMute}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 md:w-32 accent-pink-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Back to Library Link */}
          <div className="mt-6 text-center">
            <Link href="/library" className="text-pink-500 hover:text-pink-400 transition-colors">
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}