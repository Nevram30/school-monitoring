'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Layout from '../layout'

export default function StaffBorrowing() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'staff') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || session.user?.role !== 'staff') {
    return null
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Borrowing Management</h1>
          <button 
            onClick={() => router.push('/staff')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Active Borrowing Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Borrow ID</th>
                  <th className="px-4 py-2 text-left">Member</th>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Date Borrowed</th>
                  <th className="px-4 py-2 text-left">Due Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">#BRW001</td>
                  <td className="px-4 py-2">John Doe</td>
                  <td className="px-4 py-2">Projector - Epson EB-X41</td>
                  <td className="px-4 py-2">2025-01-15</td>
                  <td className="px-4 py-2">2025-01-20</td>
                  <td className="px-4 py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 mr-2">
                      Return
                    </button>
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">
                      Extend
                    </button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">#BRW002</td>
                  <td className="px-4 py-2">Jane Smith</td>
                  <td className="px-4 py-2">Laptop - Dell Latitude</td>
                  <td className="px-4 py-2">2025-01-10</td>
                  <td className="px-4 py-2">2025-01-18</td>
                  <td className="px-4 py-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      Overdue
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 mr-2">
                      Return
                    </button>
                    <button className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600">
                      Contact
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
