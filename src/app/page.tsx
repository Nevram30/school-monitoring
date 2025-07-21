'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (session?.user?.role) {
      // User is authenticated, redirect based on role
      switch (session.user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'staff':
          router.push('/staff');
          break;
        case 'faculty':
          router.push('/faculty');
          break;
        default:
          router.push('/login');
      }
    } else {
      // User is not authenticated, redirect to login
      router.push('/login');
    }
  }, [session, status, router]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}
