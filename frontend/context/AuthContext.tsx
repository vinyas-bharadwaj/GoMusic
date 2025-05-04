"use client"

import { useRouter } from "next/navigation"; // Change from next/router to next/navigation
import React, { createContext, useState, useEffect, useContext } from "react"

interface AuthTokens {
    token: string | null;
}

interface User {
    username: string;
    email: string;
    id: string;
}

interface AuthContextType {
    user: User | null;
    loginUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    signupUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    logoutUser: () => Promise<void>;
    authTokens: AuthTokens | null;
    isLoading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [authTokens, setAuthTokens] = useState<AuthTokens | null>(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            return storedToken ? { token: storedToken } : null;
        }
        return null;
    });

    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        }
        return null;
    });

    const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        const form = e.currentTarget;
        const username = form.username.value;
        const password = form.password.value;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update context state
            setAuthTokens({ token: data.token });
            setUser(data.user);
            
            // Redirect to home page
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong during login');
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const signupUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        const form = e.currentTarget;
        const username = form.username.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            setIsLoading(false);
            return;
        }
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Store token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update context state
            setAuthTokens({ token: data.token });
            setUser(data.user);
            
            // Redirect to home page
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong during registration');
            console.error("Signup error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const logoutUser = async () => {
        try {
            // Remove token and user info from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Update context state
            setAuthTokens(null);
            setUser(null);
            
            // Redirect to login page
            router.push('/login');
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    // Check if token is valid on context mount/update
    useEffect(() => {
        if (authTokens?.token) {
            // You could add token validation here if needed
            // For example, sending a request to verify the token is still valid
            // This is optional and depends on your backend implementation
        }
    }, [authTokens]);

    const contextValue: AuthContextType = {
        user,
        loginUser,
        signupUser,
        logoutUser,
        authTokens,
        isLoading,
        error,
        setError
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;