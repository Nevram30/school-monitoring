'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function FacultyHeader() {
    const { data: session } = useSession()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">SCHOOL PROPERTY MONITORING SYSTEM</h1>
                </div>
                
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                    >
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'F'}
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-gray-700">{session?.user?.name || 'Faculty'}</div>
                            <div className="text-xs text-gray-500 capitalize">{session?.user?.role || 'faculty'}</div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                <div className="font-medium">{session?.user?.name || 'Faculty'}</div>
                                <div className="text-xs text-gray-500">{session?.user?.username || 'faculty@school.com'}</div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
