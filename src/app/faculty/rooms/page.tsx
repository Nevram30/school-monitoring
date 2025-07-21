'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import RoleBasedLayout from '@/components/RoleBasedLayout'

export default function FacultyRooms() {
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
          <h1 className="text-3xl font-bold">Room Management</h1>
          <button 
            onClick={() => router.push('/faculty')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Room 101</h3>
              <p className="text-gray-600">Capacity: 30 students</p>
              <p className="text-green-600">Available</p>
              <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Book Room
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Room 102</h3>
              <p className="text-gray-600">Capacity: 25 students</p>
              <p className="text-red-600">Occupied</p>
              <button className="mt-2 bg-gray-400 text-white px-3 py-1 rounded text-sm" disabled>
                Unavailable
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Lab 201</h3>
              <p className="text-gray-600">Computer Lab</p>
              <p className="text-green-600">Available</p>
              <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Book Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  )
}
