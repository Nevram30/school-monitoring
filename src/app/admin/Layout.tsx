'use client'
import React, { PropsWithChildren } from 'react'

import { withAuth, withAuthLayout } from '../../../server/withAuth'
import FullScreenLoader from '@/components/ui-components/loader.screen'
import AsideNavigation from './components/aside.navigation'
import AdminHeader from './components/header'

const ProtectedLayout: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  const { isLoading, isAuthenticated, logout } = withAuth({
    role: 'admin',
    redirectTo: '/signin',
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FullScreenLoader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">
            {!isAuthenticated ? 'Yo have no account' : ' Invalid role'}
          </div>
          <button
            onClick={logout}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      <AsideNavigation />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default withAuthLayout({
  role: 'admin',
  redirectTo: '/signin',
  unauthorizedRedirect: '/admin/forbidden',
})(ProtectedLayout)
