'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUpload, FaMusic, FaFileAudio, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function UploadSong() {
  const router = useRouter();
  const { authTokens } = useAuth();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'audio/mpeg') {
        setError('Only MP3 files are allowed');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'audio/mpeg') {
        setError('Only MP3 files are allowed');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select an MP3 file to upload');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('album', album);
      formData.append('genre', genre);
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/songs`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authTokens?.token}`
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload song');
      }

      const data = await response.json();
      setSuccess('Song uploaded successfully!');
      
      // Reset form after successful upload
      setTitle('');
      setArtist('');
      setAlbum('');
      setGenre('');
      setFile(null);
      
      // Redirect to song page after a delay
      setTimeout(() => {
        router.push(`/song/${data.song.ID}`);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className=" min-h-screen pb-16">
      {/* Main Content - with proper padding and scroll behavior */}
      <div className="relative z-10 pt-24 px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 shadow-xl rounded-lg p-6 md:p-8 border border-gray-800 bg-opacity-90">
            {/* Header */}
            <div className="flex items-center justify-center mb-8">
              <FaUpload className="text-pink-500 text-3xl mr-3" />
              <h1 className="text-3xl font-bold text-white">Upload Song</h1>
            </div>
            
            {/* Status Messages */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
                <FaExclamationCircle className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center">
                <FaCheckCircle className="mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleSubmit}>
              {/* File Upload Area */}
              <div className="mb-6">
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800/50 transition-colors
                    ${file ? 'border-pink-500/50 bg-gray-800/30' : 'border-gray-700 bg-gray-800/10'}`}
                  onClick={triggerFileInput}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="audio/mpeg" 
                    onChange={handleFileChange}
                  />
                  
                  {file ? (
                    <>
                      <FaFileAudio className="text-5xl text-pink-500 mb-4" />
                      <p className="text-white font-medium text-center break-all">{file.name}</p>
                      <p className="text-gray-400 text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <FaMusic className="text-5xl text-gray-600 mb-4" />
                      <p className="text-white font-medium">Drag & Drop your MP3 file here</p>
                      <p className="text-gray-400 text-sm mt-1">or click to browse your files</p>
                    </>
                  )}
                </div>
              </div>

              {/* Song Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="mb-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="title">
                    Song Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Enter song title"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="artist">
                    Artist Name *
                  </label>
                  <input
                    id="artist"
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Enter artist name"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="album">
                    Album
                  </label>
                  <input
                    id="album"
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Enter album name (optional)"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="genre">
                    Genre
                  </label>
                  <input
                    id="genre"
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Enter genre (optional)"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <FaUpload className="mr-2" />
                  )}
                  Upload Song
                </button>
                
                <Link href="/library" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center justify-center">
                  Cancel
                </Link>
              </div>
            </form>

            <div className="mt-8 border-t border-gray-800 pt-6 text-center">
              <p className="text-gray-400 text-sm">
                Supported file format: MP3. Maximum file size: 30MB.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                By uploading, you confirm that you have the rights to share this music.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}