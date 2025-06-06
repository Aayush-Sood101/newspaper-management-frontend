'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Loader2 } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsCheckingAuth(false);
          return;
        }

        console.log('🔍 Checking existing token...');

        // Verify token is still valid
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });

        if (res.ok) {
          const userData = await res.json();
          console.log('🔍 Existing auth userData:', userData);
          
          const userRole = userData.role || (Array.isArray(userData.roles) && userData.roles[0]);
          console.log('🔍 Existing auth user role:', userRole);
          
          // FIXED: Make redirects consistent
          if (userRole === 'admin') {
            console.log('✅ Redirecting existing admin to /home');
            router.replace('/home');
          } else {
            console.log('✅ Redirecting existing user to /daily');
            router.replace('/daily');
          }
          return;
        } else {
          console.log('❌ Existing token invalid, removing...');
          localStorage.removeItem('authToken');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('authToken');
      }
      
      setIsCheckingAuth(false);
    };

    checkExistingAuth();
  }, [router, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔍 Attempting signin...');
      
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log('🔍 Signin response:', data);
      
      if (!res.ok) {
        setError(data.message || 'Sign-in failed');
        setIsLoading(false);
        return;
      }

      // Persist token
      localStorage.setItem('authToken', data.token);
      console.log('✅ Token saved to localStorage');

      // Get role from decoded JWT
      const decoded = jwtDecode(data.token);
      const role = decoded.role;
      console.log('🔍 Decoded role from JWT:', role);

      // FIXED: Use consistent redirect paths and add delay
      if (role === 'admin') {
        console.log('✅ Redirecting new admin to /home');
        // Add small delay to ensure token is saved
        setTimeout(() => {
          router.push('/home');
        }, 100);
      } else {
        console.log('✅ Redirecting new user to /daily');
        setTimeout(() => {
          router.push('/daily');
        }, 100);
      }

    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading while checking existing authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="text-gray-600">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="input"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
}