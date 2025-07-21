'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FacultyAsideNavigation() {
    const pathname = usePathname()

    const navigationItems = [
        {
            href: '/faculty/dashboard',
            label: 'Dashboard',
            icon: '📊'
        },
        {
            href: '/faculty/transaction',
            label: 'Transaction',
            icon: '💳'
        },
        {
            href: '/faculty/new',
            label: 'New',
            icon: '➕'
        },
        {
            href: '/faculty/borrowed-items',
            label: 'Borrowed Items',
            icon: '📤'
        },
        {
            href: '/faculty/returned-items',
            label: 'Returned Items',
            icon: '✅'
        }
    ]

    return (
        <aside className="w-64 min-h-screen bg-gray-50 border-r border-gray-200">
            <nav className="mt-4">
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
        </aside>
    )
}
