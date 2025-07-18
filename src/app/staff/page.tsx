'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import {
  CubeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface StaffStats {
  totalItems: number;
  totalMembers: number;
  activeBorrows: number;
  overdueBorrows: number;
  myBorrows: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  date: string;
}

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StaffStats>({
    totalItems: 0,
    totalMembers: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    myBorrows: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user is staff (type 2)
    if (session.user.type !== 2) {
      router.push('/dashboard'); // Redirect non-staff to admin dashboard
      return;
    }

    fetchStaffData();
  }, [session, status, router]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats from reports API
      const reportsResponse = await fetch('/api/reports?type=summary');
      const reportsData = await reportsResponse.json();

      if (reportsData.success) {
        setStats({
          totalItems: reportsData.data.totalItems || 0,
          totalMembers: reportsData.data.totalMembers || 0,
          activeBorrows: reportsData.data.activeBorrows || 0,
          overdueBorrows: reportsData.data.overdueBorrows || 0,
          myBorrows: 0 // Could be implemented to show staff's own borrows
        });
        
        setRecentActivity(reportsData.data.recentActivity || []);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Items',
      value: stats.totalItems,
      icon: CubeIcon,
      color: 'bg-blue-500',
      href: '/staff/items'
    },
    {
      name: 'Total Members',
      value: stats.totalMembers,
      icon: UsersIcon,
      color: 'bg-green-500',
      href: '/staff/members'
    },
    {
      name: 'Active Borrows',
      value: stats.activeBorrows,
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      href: '/staff/borrowing'
    },
    {
      name: 'Overdue Items',
      value: stats.overdueBorrows,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      href: '/staff/borrowing'
    }
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {session?.user?.name}! Here's your staff overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.name}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => window.location.href = card.href}
            >
              <dt>
                <div className={`absolute ${card.color} rounded-md p-3`}>
                  <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {card.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value}
                </p>
                {card.name === 'Overdue Items' && card.value > 0 && (
                  <span className="ml-2 text-sm font-medium text-red-600">
                    Needs attention
                  </span>
                )}
              </dd>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-5">
              <div className="flow-root">
                {recentActivity.length > 0 ? (
                  <ul className="-mb-8">
                    {recentActivity.slice(0, 5).map((activity, activityIdx) => (
                      <li key={`staff-activity-${activity.id}-${activityIdx}`}>
                        <div className="relative pb-8">
                          {activityIdx !== Math.min(recentActivity.length, 5) - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {activity.description}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {formatTimeAgo(activity.date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Activity will appear here as items are borrowed and returned.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Staff Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => window.location.href = '/staff/borrowing'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <ClipboardDocumentListIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Manage Borrowing
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Process borrowing and returns
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/staff/items'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <CubeIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    View Items
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Browse inventory items
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/staff/members'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <UsersIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    View Members
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Browse school members
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
