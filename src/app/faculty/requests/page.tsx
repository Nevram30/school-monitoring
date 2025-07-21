'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import RoleBasedLayout from '@/components/RoleBasedLayout'

export default function FacultyRequests() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'faculty') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || session.user?.role !== 'faculty') {
    return null
  }

  return (
    <RoleBasedLayout requiredRole="faculty">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Requests</h1>
          <button 
            onClick={() => router.push('/faculty')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Request History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Request ID</th>
                  <th className="px-4 py-2 text-left">Item/Room</th>
                  <th className="px-4 py-2 text-left">Date Requested</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">#REQ001</td>
                  <td className="px-4 py-2">Projector - Epson EB-X41</td>
                  <td className="px-4 py-2">2025-01-15</td>
                  <td className="px-4 py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Approved
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">#REQ002</td>
                  <td className="px-4 py-2">Room 101</td>
                  <td className="px-4 py-2">2025-01-18</td>
                  <td className="px-4 py-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm mr-2">
                      View Details
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Cancel
                    </button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">#REQ003</td>
                  <td className="px-4 py-2">Laptop - Dell Latitude</td>
                  <td className="px-4 py-2">2025-01-19</td>
                  <td className="px-4 py-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      Rejected
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  )
}
