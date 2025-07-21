'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function StaffAsideNavigation() {
    const pathname = usePathname()

    const navigationItems = [
        {
            href: '/staff/dashboard',
            label: 'Dashboard',
            icon: '📊'
        },
        {
            href: '/staff/transaction',
            label: 'Transaction',
            icon: '💳'
        },
        {
            href: '/staff/new',
            label: 'New',
            icon: '➕'
        },
        {
            href: '/staff/borrowed-items',
            label: 'Borrowed Items',
            icon: '📤'
        },
        {
            href: '/staff/returned-items',
            label: 'Returned Items',
            icon: '✅'
        }
    ]

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <aside className="w-64 min-h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-white">
                <h1 className="text-xl font-bold text-gray-800">Staff Panel</h1>
                <p className="text-sm text-gray-600 mt-1">Property Management</p>
            </div>
            
            <nav className="mt-4 flex-1">
                <ul className="space-y-1">
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                                        isActive
                                            ? 'bg-blue-500 text-white border-r-4 border-blue-600'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <span className="mr-3 text-base">{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                >
                    <span className="mr-3 text-lg">🚪</span>
                    Logout
                </button>
            </div>
        </aside>
    )
}
