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
  const timeoutRef = useRef(null);

  // Memoize requiredRoles to prevent unnecessary re-renders
  const memoizedRequiredRoles = useMemo(() => requiredRoles, [requiredRoles]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Prevent multiple auth checks and wait for mount
    if (hasCheckedAuth.current || !mounted) return;

    let isMounted = true;
    const token = localStorage.getItem('authToken');
    
    // Set timeout only if token exists
    if (token) {
      timeoutRef.current = setTimeout(() => {
        if (isMounted && !hasCheckedAuth.current) {
          console.warn('Auth check timeout reached. Clearing token and reloading...');
          localStorage.removeItem('authToken');
          hasCheckedAuth.current = true; // Prevent further checks
          window.location.reload();
        }
      }, 3000);
    }

    const checkAuth = async () => {
      try {
        if (!token) {
          console.log('No token found');
          if (isMounted) {
            setIsLoading(false);
          }
          hasCheckedAuth.current = true; // Mark as checked even without token
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          return;
        }

        console.log('Starting auth verification...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
          console.log('Auth verification failed:', res.status, res.statusText);
          localStorage.removeItem('authToken');
          hasCheckedAuth.current = true; // Mark as checked
          if (isMounted) {
            setIsLoading(false);
            router.replace('/');
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          return;
        }

        const userData = await res.json();
        console.log('Auth response data:', userData); // Debug log
        
        // Since backend returns { id, email, role }, extract role directly
        const userRole = userData.role;
        
        console.log('Extracted user role:', userRole);
        console.log('Required roles:', memoizedRequiredRoles);
        console.log('Role type:', typeof userRole);
        console.log('Required roles types:', memoizedRequiredRoles.map(r => typeof r));

        // Always mark as checked after successful API response
        hasCheckedAuth.current = true;

        // Check if role authorization is required and if user has the right role
        if (memoizedRequiredRoles.length > 0) {
          if (!userRole) {
            console.log('No user role found');
            if (isMounted) {
              setIsLoading(false);
              router.replace('/unauthorized');
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            return;
          }
          
          if (!memoizedRequiredRoles.includes(userRole)) {
            console.log('User role not authorized. User role:', userRole, 'Required:', memoizedRequiredRoles);
            if (isMounted) {
              setIsLoading(false);
              router.replace('/unauthorized');
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            return;
          }
        }

        console.log('Auth verification successful');
        if (isMounted) {
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        
        // Always mark as checked to prevent infinite loops
        hasCheckedAuth.current = true;
        
        if (err.name === 'AbortError') {
          console.warn('Auth request timed out, will be handled by main timeout');
          return;
        }
        
        localStorage.removeItem('authToken');
        if (isMounted) {
          setIsLoading(false);
          router.replace('/');
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [mounted, memoizedRequiredRoles, router]);

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    hasCheckedAuth.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    router.replace('/');
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) {
    return { isAuthenticated: false, isLoading: true, user: null, logout };
  }

  return { isAuthenticated, isLoading, user, logout };
}