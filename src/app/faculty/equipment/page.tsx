'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Layout from '../layout'


export default function FacultyEquipment() {
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
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Equipment Requests</h1>
          <button 
            onClick={() => router.push('/faculty')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Projector</h3>
              <p className="text-gray-600">Model: Epson EB-X41</p>
              <p className="text-green-600">Available (3 units)</p>
              <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Request
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Laptop</h3>
              <p className="text-gray-600">Model: Dell Latitude</p>
              <p className="text-yellow-600">Limited (1 unit)</p>
              <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Request
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Microphone</h3>
              <p className="text-gray-600">Wireless Mic System</p>
              <p className="text-red-600">Unavailable</p>
              <button className="mt-2 bg-gray-400 text-white px-3 py-1 rounded text-sm" disabled>
                Out of Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
