// lib/useAuth.js
'use client'

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRoles = []) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const hasCheckedAuth = useRef(false);
  
  // Memoize requiredRoles to prevent unnecessary re-renders
  const memoizedRequiredRoles = useMemo(() => requiredRoles, [JSON.stringify(requiredRoles)]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Prevent multiple auth checks and wait for mount
    if (hasCheckedAuth.current || !mounted) return;
    
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // grab token
        const token = localStorage.getItem('authToken');
        if (!token) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        // verify against backend
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include'
          }
        );

        if (!res.ok) {
          localStorage.removeItem('authToken');
          if (isMounted) {
            setIsLoading(false);
            router.replace('/');
          }
          return;
        }

        const userData = await res.json();

        // normalize role array vs. single role
        const userRole = userData.role || (Array.isArray(userData.roles) && userData.roles[0]);

        // role-based access check
        if (memoizedRequiredRoles.length > 0 && !memoizedRequiredRoles.includes(userRole)) {
          if (isMounted) {
            setIsLoading(false);
            router.replace('/unauthorized');
          }
          return;
        }

        if (isMounted) {
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          hasCheckedAuth.current = true;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('authToken');
        if (isMounted) {
          setIsLoading(false);
          router.replace('/');
        }
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [mounted, memoizedRequiredRoles, router]);

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    hasCheckedAuth.current = false;
    router.replace('/');
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) {
    return { isAuthenticated: false, isLoading: true, user: null, logout };
  }

  return { isAuthenticated, isLoading, user, logout };
}