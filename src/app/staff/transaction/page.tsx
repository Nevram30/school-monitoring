'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Borrow {
    id: number;
    member_id: number;
    item_id: number;
    room_id: number;
    b_quantity: number;
    b_date_borrowed: string;
    b_due_date: string;
    b_status: number;
    Item?: {
        i_model: string;
        i_deviceID: string;
    };
    Member?: {
        m_fname: string;
        m_lname: string;
    };
    Room?: {
        r_name: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function BorrowingPage() {
    const [borrows, setBorrows] = useState<Borrow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [borrowers, setBorrowers] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [formData, setFormData] = useState({
        b_itemid: '',
        b_memberid: '',
        b_roomid: '',
        b_qty: '1',
        b_returndate: ''
    });

    useEffect(() => {
        fetchBorrows();
    }, [pagination.page, search, statusFilter]);

    const fetchBorrows = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/borrows?page=${pagination.page}&limit=${pagination.limit}&search=${search}&status=${statusFilter}`
            );

            const data = await response.json();
            if (data.success) {
                setBorrows(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching borrows:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchBorrows();
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const getStatusString = (status: number) => {
        switch (status) {
            case 1: return 'Borrowed';
            case 2: return 'Returned';
            case 3: return 'Overdue';
            default: return 'Unknown';
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1: return 'bg-yellow-100 text-yellow-800'; // Borrowed
            case 2: return 'bg-green-100 text-green-800';   // Returned
            case 3: return 'bg-red-100 text-red-800';       // Overdue
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const isOverdue = (returnDate: string, status: number) => {
        if (status === 2) return false; // 2 = returned
        return new Date(returnDate) < new Date();
    };

    const fetchDropdownData = async () => {
        try {
            // Fetch items, borrowers, and rooms
            const [itemsRes, borrowersRes, roomsRes] = await Promise.all([
                fetch('/api/items?limit=1000'),
                fetch('/api/borrowers?limit=1000'),
                fetch('/api/rooms?limit=1000')
            ]);

            const [itemsData, borrowersData, roomsData] = await Promise.all([
                itemsRes.json(),
                borrowersRes.json(),
                roomsRes.json()
            ]);

            if (itemsData.success) setItems(itemsData.data);
            if (borrowersData.success) setBorrowers(borrowersData.data);
            if (roomsData.success) setRooms(roomsData.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/borrows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    member_id: parseInt(formData.b_memberid),
                    item_id: parseInt(formData.b_itemid),
                    stock_id: parseInt(formData.b_qty),
                    room_assigned: parseInt(formData.b_roomid),
                    time_limit: formData.b_returndate
                })
            });

            const data = await response.json();
            if (data.success) {
                setShowAddModal(false);
                setFormData({
                    b_itemid: '',
                    b_memberid: '',
                    b_roomid: '',
                    b_qty: '1',
                    b_returndate: ''
                });
                fetchBorrows(); // Refresh the list
                alert('Borrow record created successfully!');
            } else {
                alert('Error creating borrow record: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating borrow record:', error);
            alert('Error creating borrow record');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddClick = () => {
        fetchDropdownData();
        setShowAddModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Borrowing</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage property borrowing transactions and track returns.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={handleAddClick}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        New Borrow
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Search by member name, item model, or device ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="borrowed">Borrowed</option>
                                <option value="returned">Returned</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Borrowing Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Borrower
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Borrow Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Return Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {borrows.map((borrow) => (
                                        <tr key={borrow.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div>
                                                    <div className="font-medium">{borrow.Item?.i_model || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{borrow.Item?.i_deviceID || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {borrow.Member ? `${borrow.Member.m_fname} ${borrow.Member.m_lname}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {borrow.Room?.r_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {borrow.b_quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(borrow.b_date_borrowed).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className={isOverdue(borrow.b_due_date, borrow.b_status) ? 'text-red-600 font-medium' : ''}>
                                                    {new Date(borrow.b_due_date).toLocaleDateString()}
                                                    {isOverdue(borrow.b_due_date, borrow.b_status) && (
                                                        <div className="text-xs text-red-500">Overdue</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isOverdue(borrow.b_due_date, borrow.b_status)
                                                    ? 'bg-red-100 text-red-800'
                                                    : getStatusColor(borrow.b_status)
                                                    }`}>
                                                    {isOverdue(borrow.b_due_date, borrow.b_status) ? 'Overdue' : getStatusString(borrow.b_status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {borrows.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-sm text-gray-500">No borrowing records found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {(pagination.page - 1) * pagination.limit + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">{pagination.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Borrow Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">New Borrow Transaction</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Item</label>
                                        <select
                                            name="b_itemid"
                                            value={formData.b_itemid}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Choose an item...</option>
                                            {items.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.i_model} - {item.i_deviceID} (Stock: {item.item_rawstock})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Borrower</label>
                                        <select
                                            name="b_memberid"
                                            value={formData.b_memberid}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Choose a borrower...</option>
                                            {borrowers.map((borrower: any) => (
                                                <option key={borrower.id} value={borrower.id}>
                                                    {borrower.m_fname} {borrower.m_lname} ({borrower.m_type})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Room</label>
                                        <select
                                            name="b_roomid"
                                            value={formData.b_roomid}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Choose a room...</option>
                                            {rooms.map((room) => (
                                                <option key={room.id} value={room.id}>
                                                    {room.r_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                        <input
                                            type="number"
                                            name="b_qty"
                                            value={formData.b_qty}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter quantity"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Expected Return Date</label>
                                        <input
                                            type="date"
                                            name="b_returndate"
                                            value={formData.b_returndate}
                                            onChange={handleInputChange}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {submitting ? 'Creating...' : 'Create Borrow'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
