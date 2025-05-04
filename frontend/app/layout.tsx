import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "GoMusic",
  description: "Stream your music with GoMusic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Shared background elements */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
            
            {/* Static glows */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-700 rounded-full opacity-5 blur-3xl translate-x-1/4 translate-y-1/4"></div>
            
            {/* Sound wave effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-24 flex items-center justify-center opacity-20">
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
          
          <Navbar />
          <main className="min-h-screen bg-black">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
