'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for authentication token in localStorage
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
          setIsAuthenticated(false);
          // Redirect to login, preserving the intended destination
          router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
          return;
        }

        // Optional: Validate token with backend
        // Uncomment if you have a validation endpoint
        /*
        const response = await fetch('/api/auth/validate', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
          return;
        }
        */

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-brand">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-saffron-500/20 to-violet-500/20 blur-xl"
            />
            <Loader2 className="relative w-10 h-10 text-violet-400 animate-spin" />
          </div>
          <p className="text-midnight-300 text-sm font-medium">
            Verifying access...
          </p>
        </motion.div>
      </div>
    );
  }

  // Redirect if not authenticated (shouldn't reach here due to router.replace)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 * Usage: export default withProtectedRoute(MyComponent);
 */
export function withProtectedRoute<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for checking authentication status
 * Usage: const { isAuthenticated, isLoading } = useAuth();
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  return { isAuthenticated, isLoading };
}

export default ProtectedRoute;
