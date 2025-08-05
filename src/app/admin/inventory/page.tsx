'use client'

import { useState, useEffect } from 'react'
import Layout from '../Layout'

interface InventoryItem {
    id: number
    i_deviceID: string
    i_model: string
    i_category: string
    i_brand: string
    i_description: string
    i_type: string
    item_rawstock: number
    i_status: number
    i_mr: string
    i_price: number
    i_photo: string
    no_of_items?: number
    remarks?: string
}

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<string>('new')
    const [searchTerm, setSearchTerm] = useState('')
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        fetchInventoryItems()
    }, [activeTab, searchTerm, pagination.page])

    const fetchInventoryItems = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: searchTerm
            })

            const response = await fetch(`/api/items?${params}`)
            const data = await response.json()

            if (data.success) {
                setInventoryItems(data.data)
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages
                }))
            }
        } catch (error) {
            console.error('Error fetching inventory items:', error)
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { key: 'new', label: 'New', color: 'bg-blue-500 text-white', status: null },
        { key: 'old', label: 'Old', color: 'bg-blue-500 text-white', status: null },
        { key: 'available', label: 'Available', color: 'bg-blue-500 text-white', status: 1 },
        { key: 'borrowed', label: 'Borrowed', color: 'bg-blue-500 text-white', status: 2 },
        { key: 'maintenance', label: 'Maintenance', color: 'bg-blue-500 text-white', status: 3 },
        { key: 'damaged', label: 'Damaged', color: 'bg-blue-500 text-white', status: 4 },
        { key: 'total', label: 'Total Items', color: 'bg-blue-500 text-white', status: null }
    ]

    const exportButtons = [
        { key: 'copy', label: 'Copy', color: 'bg-blue-500' },
        { key: 'csv', label: 'CSV', color: 'bg-green-500' },
        { key: 'excel', label: 'Excel', color: 'bg-emerald-600' },
        { key: 'pdf', label: 'PDF', color: 'bg-red-500' },
        { key: 'print', label: 'Print', color: 'bg-gray-600' }
    ]

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 1: return 'Available'
            case 2: return 'Borrowed'
            case 3: return 'Maintenance'
            case 4: return 'Damaged'
            default: return 'Unknown'
        }
    }

    // Helper function to determine if an item is "new" or "old"
    const isNewItem = (item: InventoryItem) => {
        // Items added in the last 6 months or with higher IDs are considered "new"
        // This is a simple heuristic - in a real system you might use actual timestamps
        const maxId = Math.max(...inventoryItems.map(i => i.id))
        const threshold = maxId * 0.7 // Consider top 30% of IDs as "new"
        return item.id > threshold
    }

    const filteredItems = inventoryItems.filter(item => {
        const currentTab = tabs.find(tab => tab.key === activeTab)

        let statusMatch = true

        if (activeTab === 'new') {
            statusMatch = isNewItem(item)
        } else if (activeTab === 'old') {
            statusMatch = !isNewItem(item)
        } else if (activeTab === 'total') {
            statusMatch = true
        } else {
            statusMatch = item.i_status === currentTab?.status
        }

        const searchMatch = !searchTerm || (
            item.i_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.i_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.i_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.i_description.toLowerCase().includes(searchTerm.toLowerCase())
        )

        return statusMatch && searchMatch
    })

    const handleExport = (type: string) => {
        // Export functionality would be implemented here
        alert(`Exporting as ${type}`)
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage and track your equipment inventory
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? tab.color : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Export Buttons */}
                <div className="flex flex-wrap gap-2">
                    {exportButtons.map((button) => (
                        <button
                            key={button.key}
                            onClick={() => handleExport(button.key)}
                            className={`px-4 py-2 ${button.color} text-white text-sm rounded hover:opacity-90 transition-opacity`}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex justify-end">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading inventory...</span>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Device ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Model
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Brand
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                                            {searchTerm ? 'No items found matching your search.' : 'No items found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.i_deviceID}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.i_model}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.i_category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.i_brand}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.item_rawstock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.i_status === 1 ? 'bg-green-100 text-green-800' :
                                                    item.i_status === 2 ? 'bg-yellow-100 text-yellow-800' :
                                                        item.i_status === 3 ? 'bg-blue-100 text-blue-800' :
                                                            item.i_status === 4 ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {getStatusLabel(item.i_status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ₱{item.i_price?.toLocaleString() || '0.00'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                            {pagination.page}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
