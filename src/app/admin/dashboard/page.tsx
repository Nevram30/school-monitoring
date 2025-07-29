'use client';

import { useState, useEffect } from 'react';
import {
  CubeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Layout from '../Layout';

interface DashboardStats {
  totalItems: number;
  totalMembers: number;
  totalRooms: number;
  activeBorrows: number;
  overdueBorrows: number;
  returnedThisMonth: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  date: string;
}

interface RecentBorrow {
  id: number;
  Item?: {
    i_model: string;
    i_deviceID: string;
  };
  Member?: {
    m_fname: string;
    m_lname: string;
  };
  b_date_borrowed: string;
  b_status: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalMembers: 0,
    totalRooms: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    returnedThisMonth: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentBorrows, setRecentBorrows] = useState<RecentBorrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive stats from reports API
      const reportsResponse = await fetch('/api/reports?type=summary');
      const reportsData = await reportsResponse.json();
      
      // Fetch recent borrows for activity feed
      const borrowsResponse = await fetch('/api/borrows?limit=5');
      const borrowsData = await borrowsResponse.json();

      if (reportsData.success) {
        setStats({
          totalItems: reportsData.data.totalItems || 0,
          totalMembers: reportsData.data.totalMembers || 0,
          totalRooms: reportsData.data.totalRooms || 0,
          activeBorrows: reportsData.data.activeBorrows || 0,
          overdueBorrows: reportsData.data.overdueBorrows || 0,
          returnedThisMonth: reportsData.data.returnedThisMonth || 0
        });
        
        setRecentActivity(reportsData.data.recentActivity || []);
      }

      if (borrowsData.success) {
        setRecentBorrows(borrowsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      href: '/dashboard/items'
    },
    {
      name: 'Total Members',
      value: stats.totalMembers,
      icon: UsersIcon,
      color: 'bg-green-500',
      href: '/dashboard/members'
    },
    {
      name: 'Total Rooms',
      value: stats.totalRooms,
      icon: BuildingOfficeIcon,
      color: 'bg-yellow-500',
      href: '/dashboard/rooms'
    },
    {
      name: 'Active Borrows',
      value: stats.activeBorrows,
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      href: '/dashboard/borrowing'
    },
    {
      name: 'Overdue Items',
      value: stats.overdueBorrows,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      href: '/dashboard/borrowing'
    },
    {
      name: 'Returned This Month',
      value: stats.returnedThisMonth,
      icon: CheckCircleIcon,
      color: 'bg-emerald-500',
      href: '/dashboard/borrowing'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'borrow':
        return ClipboardDocumentListIcon;
      case 'return':
        return CheckCircleIcon;
      case 'item':
        return CubeIcon;
      case 'member':
        return UsersIcon;
      case 'room':
        return BuildingOfficeIcon;
      case 'overdue':
        return ExclamationTriangleIcon;
      default:
        return CubeIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'borrow':
        return 'bg-blue-500';
      case 'return':
        return 'bg-green-500';
      case 'item':
        return 'bg-purple-500';
      case 'member':
        return 'bg-yellow-500';
      case 'room':
        return 'bg-indigo-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes < 1) {
        return 'Just now';
      }
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays > 30) {
        return date.toLocaleDateString();
      }
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to the School Property Monitoring System
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`-ml-0.5 mr-1.5 h-3 w-3 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
            <div className="mt-5">
              <div className="flow-root">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading recent activity...</p>
                  </div>
                ) : recentActivity.length > 0 ? (
                  <ul className="-mb-8">
                    {recentActivity.map((activity, activityIdx) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      const activityColor = getActivityColor(activity.type);
                      
                      return (
                        <li key={`activity-${activity.id}-${activityIdx}`}>
                          <div className="relative pb-8">
                            {activityIdx !== recentActivity.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full ${activityColor} flex items-center justify-center ring-8 ring-white`}>
                                  <ActivityIcon className="h-5 w-5 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className={`text-sm ${activity.type === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
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
                      );
                    })}
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

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => window.location.href = '/dashboard/items'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <CubeIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Manage Items
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add, edit, or view inventory items
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/dashboard/members'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <UsersIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Manage Members
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add or view school members
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/dashboard/borrowing'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <ClipboardDocumentListIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    New Borrow
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create a new borrowing transaction
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/dashboard/reports'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-500 border border-gray-200 rounded-lg hover:border-yellow-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                    <BuildingOfficeIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    View Reports
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Generate analytics and reports
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/dashboard/users'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                    <UsersIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Manage Users
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add, edit, or delete system users
                  </p>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/dashboard/rooms'}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                    <BuildingOfficeIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Manage Rooms
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add or view school rooms
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
