'use client';

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

  const memoizedRequiredRoles = useMemo(() => requiredRoles, [requiredRoles]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hasCheckedAuth.current || !mounted) return;

    let isMounted = true;
    const token = localStorage.getItem('authToken');

    if (token) {
      timeoutRef.current = setTimeout(() => {
        if (isMounted && !hasCheckedAuth.current) {
          console.warn('Auth check timeout reached. Clearing token and reloading...');
          localStorage.removeItem('authToken');
          hasCheckedAuth.current = true;
          window.location.reload();
        }
      }, 3000);
    }

    const checkAuth = async () => {
      try {
        if (!token) {
          console.log('No token found');
          hasCheckedAuth.current = true;
          if (isMounted) setIsLoading(false);
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
          hasCheckedAuth.current = true;
          if (isMounted) {
            setIsLoading(false);
            router.replace('/');
          }
          return;
        }

        const userData = await res.json();
        
        // DEBUG: Log the complete response
        console.log('🔍 Full userData response:', userData);
        console.log('🔍 Required roles:', memoizedRequiredRoles);
        
        const userRole = userData?.role?.toLowerCase();
        const required = memoizedRequiredRoles.map(r => r.toLowerCase());

        // DEBUG: Log role comparison
        console.log('🔍 User role (lowercase):', userRole);
        console.log('🔍 Required roles (lowercase):', required);
        console.log('🔍 Role check result:', required.length > 0 ? required.includes(userRole) : true);

        hasCheckedAuth.current = true;

        // Check if user has the required role
        if (required.length > 0 && (!userRole || !required.includes(userRole))) {
          console.log(`❌ User role (${userRole}) not authorized. Required: ${required}`);
          if (isMounted) {
            setIsLoading(false);
            router.replace('/unauthorized');
          }
          return;
        }

        console.log('✅ Authentication and authorization successful');
        
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

  if (!mounted) {
    return { isAuthenticated: false, isLoading: true, user: null, logout };
  }

  return { isAuthenticated, isLoading, user, logout };
}