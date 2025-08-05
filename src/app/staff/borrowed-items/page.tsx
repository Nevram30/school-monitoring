'use client';

import { useState, useEffect } from 'react';

import { MagnifyingGlassIcon, XMarkIcon, EyeIcon, ArrowUturnLeftIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Copy, FileText, FileSpreadsheet, FileDown, Printer } from 'lucide-react';

interface BorrowedItem {
    id: number;
    member_id: number;
    item_id: number;
    room_id: number | null;
    b_date_borrowed: string;
    b_date_returned: string | null;
    b_due_date: string;
    b_quantity: number;
    b_status: number;
    b_purpose: string | null;
    b_notes: string | null;
    Item: {
        i_model: string;
        i_deviceID: string;
    };
    Member: {
        m_fname: string;
        m_lname: string;
    };
    Room: {
        r_name: string;
    } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function BorrowedItemsPage() {
    const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedItem, setSelectedItem] = useState<BorrowedItem | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [returnFormData, setReturnFormData] = useState({
        condition: 'Good',
        notes: '',
        lateFee: 0,
        damageFee: 0
    });

    useEffect(() => {
        fetchBorrowedItems();
    }, [pagination.page, search]);

    const fetchBorrowedItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/borrows?page=${pagination.page}&limit=${pagination.limit}&search=${search}&status=1`
            );

            const data = await response.json();
            if (data.success) {
                setBorrowedItems(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching borrowed items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchBorrowedItems();
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleViewItem = (item: BorrowedItem) => {
        setSelectedItem(item);
        setShowViewModal(true);
    };

    const handleReturnItem = (item: BorrowedItem) => {
        setSelectedItem(item);
        setReturnFormData({
            condition: 'Good',
            notes: '',
            lateFee: 0,
            damageFee: 0
        });
        setShowReturnModal(true);
    };

    const handleReturnFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setReturnFormData(prev => ({
            ...prev,
            [name]: name === 'lateFee' || name === 'damageFee' ? parseFloat(value) || 0 : value
        }));
    };

    const handleConfirmReturn = () => {
        setShowReturnModal(false);
        setShowConfirmModal(true);
    };

    const handleProcessReturn = async () => {
        if (!selectedItem) return;

        try {
            setSubmitting(true);
            const response = await fetch('/api/returns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    borrow_id: selectedItem.id,
                    r_condition: returnFormData.condition,
                    r_notes: returnFormData.notes,
                    r_late_fee: returnFormData.lateFee,
                    r_damage_fee: returnFormData.damageFee
                })
            });

            const data = await response.json();
            if (data.success) {
                fetchBorrowedItems(); // Refresh the list
                setSuccessMessage('Item returned successfully!');
                setShowSuccessModal(true);
            } else {
                alert('Error returning item: ' + data.error);
            }
        } catch (error) {
            console.error('Error returning item:', error);
            alert('Error returning item');
        } finally {
            setSubmitting(false);
            setShowConfirmModal(false);
            setSelectedItem(null);
        }
    };

    const handleCancelReturn = () => {
        setShowConfirmModal(false);
        setShowReturnModal(false);
        setSelectedItem(null);
    };

    // Export Functions
    const handleCopyData = async () => {
        try {
            const tableData = borrowedItems.map(item => ({
                'Device ID': item.Item.i_deviceID,
                'Item Model': item.Item.i_model,
                'Borrower': `${item.Member.m_fname} ${item.Member.m_lname}`,
                'Room': item.Room ? item.Room.r_name : 'N/A',
                'Quantity': item.b_quantity,
                'Date Borrowed': new Date(item.b_date_borrowed).toLocaleDateString(),
                'Due Date': new Date(item.b_due_date).toLocaleDateString(),
                'Status': item.b_status === 1 ? 'Borrowed' : 'Returned'
            }));

            const headers = Object.keys(tableData[0] || {});
            const csvContent = [
                headers.join('\t'),
                ...tableData.map(row => headers.map(header => row[header as keyof typeof row]).join('\t'))
            ].join('\n');

            await navigator.clipboard.writeText(csvContent);
            setSuccessMessage('Borrowed items data has been copied to clipboard');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error copying data:', error);
            alert('Failed to copy data to clipboard');
        }
    };

    const handleExportCSV = () => {
        try {
            const tableData = borrowedItems.map(item => ({
                'Device ID': item.Item.i_deviceID,
                'Item Model': item.Item.i_model,
                'Borrower': `${item.Member.m_fname} ${item.Member.m_lname}`,
                'Room': item.Room ? item.Room.r_name : 'N/A',
                'Quantity': item.b_quantity,
                'Date Borrowed': new Date(item.b_date_borrowed).toLocaleDateString(),
                'Due Date': new Date(item.b_due_date).toLocaleDateString(),
                'Status': item.b_status === 1 ? 'Borrowed' : 'Returned'
            }));

            const headers = Object.keys(tableData[0] || {});
            const csvContent = [
                headers.join(','),
                ...tableData.map(row =>
                    headers.map(header => {
                        const value = row[header as keyof typeof row];
                        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
                    }).join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `borrowed_items_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccessMessage('Borrowed items data has been exported as CSV file');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export CSV file');
        }
    };

    const handleExportExcel = () => {
        try {
            const tableData = borrowedItems.map(item => ({
                'Device ID': item.Item.i_deviceID,
                'Item Model': item.Item.i_model,
                'Borrower': `${item.Member.m_fname} ${item.Member.m_lname}`,
                'Room': item.Room ? item.Room.r_name : 'N/A',
                'Quantity': item.b_quantity,
                'Date Borrowed': new Date(item.b_date_borrowed).toLocaleDateString(),
                'Due Date': new Date(item.b_due_date).toLocaleDateString(),
                'Status': item.b_status === 1 ? 'Borrowed' : 'Returned'
            }));

            const headers = Object.keys(tableData[0] || {});
            const excelContent = [
                headers.join('\t'),
                ...tableData.map(row => headers.map(header => row[header as keyof typeof row]).join('\t'))
            ].join('\n');

            const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `borrowed_items_${new Date().toISOString().split('T')[0]}.xls`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccessMessage('Borrowed items data has been exported as Excel file');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Failed to export Excel file');
        }
    };

    const handleExportPDF = () => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow popups to export PDF');
                return;
            }

            const tableRows = borrowedItems.map(item => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.Item.i_deviceID}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.Item.i_model}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.Member.m_fname} ${item.Member.m_lname}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.Room ? item.Room.r_name : 'N/A'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.b_quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${new Date(item.b_date_borrowed).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${new Date(item.b_due_date).toLocaleDateString()}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Borrowed Items Report - ${new Date().toLocaleDateString()}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #333; text-align: center; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { background-color: #f8f9fa; border: 1px solid #ddd; padding: 10px; font-size: 12px; font-weight: bold; }
                            @media print { 
                                body { margin: 0; }
                                table { font-size: 10px; }
                                th, td { padding: 4px; }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Borrowed Items Report</h1>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Items:</strong> ${borrowedItems.length}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Device ID</th>
                                    <th>Item Model</th>
                                    <th>Borrower</th>
                                    <th>Room</th>
                                    <th>Quantity</th>
                                    <th>Date Borrowed</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </body>
                </html>
            `);

            printWindow.document.close();
            printWindow.focus();

            setTimeout(() => {
                printWindow.print();
                setSuccessMessage('PDF document is ready for printing/saving');
                setShowSuccessModal(true);
            }, 250);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF');
        }
    };

    const handlePrint = () => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow popups to print');
                return;
            }

            const tableRows = borrowedItems.map(item => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.Item.i_deviceID}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.Item.i_model}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.Member.m_fname} ${item.Member.m_lname}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.Room ? item.Room.r_name : 'N/A'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.b_quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.b_date_borrowed).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.b_due_date).toLocaleDateString()}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Borrowed Items Report - ${new Date().toLocaleDateString()}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #333; text-align: center; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { background-color: #f8f9fa; border: 1px solid #ddd; padding: 10px; font-weight: bold; }
                            td { border: 1px solid #ddd; padding: 8px; }
                            @media print { 
                                body { margin: 10px; }
                                h1 { font-size: 18px; }
                                table { font-size: 12px; }
                                th, td { padding: 4px; }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Borrowed Items Report</h1>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Items:</strong> ${borrowedItems.length}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Device ID</th>
                                    <th>Item Model</th>
                                    <th>Borrower</th>
                                    <th>Room</th>
                                    <th>Quantity</th>
                                    <th>Date Borrowed</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </body>
                </html>
            `);

            printWindow.document.close();
            printWindow.focus();

            setTimeout(() => {
                printWindow.print();
                setSuccessMessage('Print dialog has been opened');
                setShowSuccessModal(true);
            }, 250);
        } catch (error) {
            console.error('Error printing:', error);
            alert('Failed to open print dialog');
        }
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Borrowed Items</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Track and manage currently borrowed items from the school inventory.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSearch} className="flex space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Search borrowed items by device ID, model, or borrower name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
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

            {/* Borrowed Items Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    {/* Export Buttons */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        <button
                            onClick={handleCopyData}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FileText className="h-3 w-3 mr-1" />
                            CSV
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FileSpreadsheet className="h-3 w-3 mr-1" />
                            Excel
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FileDown className="h-3 w-3 mr-1" />
                            PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Printer className="h-3 w-3 mr-1" />
                            Print
                        </button>
                    </div>
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
                                            Device ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item Model
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
                                            Date Borrowed
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {borrowedItems.map((item) => {
                                        const overdue = isOverdue(item.b_due_date);

                                        return (
                                            <tr key={item.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                    {item.Item.i_deviceID}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.Item.i_model}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {`${item.Member.m_fname} ${item.Member.m_lname}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.Room ? item.Room.r_name : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.b_quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(item.b_date_borrowed).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`${overdue ? 'text-red-600 font-semibold' : ''}`}>
                                                        {new Date(item.b_due_date).toLocaleDateString()}
                                                        {overdue && ' (Overdue)'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewItem(item)}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                                                            title="View Details"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReturnItem(item)}
                                                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                                                            title="Return Item"
                                                        >
                                                            <ArrowUturnLeftIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {borrowedItems.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-sm text-gray-500">No borrowed items found.</p>
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

            {/* View Item Modal */}
            {showViewModal && selectedItem && (
                <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Borrowed Item Details</h3>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedItem(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
                                        <p className="text-sm text-blue-600 font-medium">{selectedItem.Item.i_deviceID}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Model</label>
                                        <p className="text-sm text-gray-900 font-medium">{selectedItem.Item.i_model}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Borrower</label>
                                        <p className="text-sm text-gray-900">{`${selectedItem.Member.m_fname} ${selectedItem.Member.m_lname}`}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Assigned</label>
                                        <p className="text-sm text-gray-900">{selectedItem.Room ? selectedItem.Room.r_name : 'N/A'}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                        <p className="text-sm text-gray-900">{selectedItem.b_quantity}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Borrowed</label>
                                        <p className="text-sm text-gray-900">{new Date(selectedItem.b_date_borrowed).toLocaleDateString()}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                        <p className={`text-sm ${isOverdue(selectedItem.b_due_date) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                            {new Date(selectedItem.b_due_date).toLocaleDateString()}
                                            {isOverdue(selectedItem.b_due_date) && ' (Overdue)'}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Borrowed
                                        </span>
                                    </div>

                                    {selectedItem.b_purpose && (
                                        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                                            <p className="text-sm text-gray-900">{selectedItem.b_purpose}</p>
                                        </div>
                                    )}

                                    {selectedItem.b_notes && (
                                        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                            <p className="text-sm text-gray-900">{selectedItem.b_notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowViewModal(false);
                                            setSelectedItem(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleReturnItem(selectedItem);
                                        }}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Return Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Item Modal */}
            {showReturnModal && selectedItem && (
                <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Return Item</h3>
                                <button
                                    onClick={handleCancelReturn}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Item Information</h4>
                                    <p className="text-sm text-blue-800">
                                        <strong>Device ID:</strong> {selectedItem.Item.i_deviceID} |
                                        <strong> Model:</strong> {selectedItem.Item.i_model} |
                                        <strong> Quantity:</strong> {selectedItem.b_quantity}
                                    </p>
                                    <p className="text-sm text-blue-800">
                                        <strong>Borrower:</strong> {`${selectedItem.Member.m_fname} ${selectedItem.Member.m_lname}`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Item Condition</label>
                                        <select
                                            name="condition"
                                            value={returnFormData.condition}
                                            onChange={handleReturnFormChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Good">Good</option>
                                            <option value="Fair">Fair</option>
                                            <option value="Damaged">Damaged</option>
                                            <option value="Lost">Lost</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Late Fee ($)</label>
                                        <input
                                            type="number"
                                            name="lateFee"
                                            value={returnFormData.lateFee}
                                            onChange={handleReturnFormChange}
                                            min="0"
                                            step="0.01"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Damage Fee ($)</label>
                                        <input
                                            type="number"
                                            name="damageFee"
                                            value={returnFormData.damageFee}
                                            onChange={handleReturnFormChange}
                                            min="0"
                                            step="0.01"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Return Notes</label>
                                    <textarea
                                        name="notes"
                                        value={returnFormData.notes}
                                        onChange={handleReturnFormChange}
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Additional notes about the return..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancelReturn}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmReturn}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Process Return
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedItem && (
                <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <ArrowUturnLeftIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                                Confirm Return
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to return this item?
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-2">
                                    {selectedItem.Item.i_deviceID} - {selectedItem.Item.i_model}
                                </p>
                                <div className="text-xs text-gray-400 mt-2 space-y-1">
                                    <p><strong>Condition:</strong> {returnFormData.condition}</p>
                                    {returnFormData.lateFee > 0 && <p><strong>Late Fee:</strong> ${returnFormData.lateFee}</p>}
                                    {returnFormData.damageFee > 0 && <p><strong>Damage Fee:</strong> ${returnFormData.damageFee}</p>}
                                </div>
                            </div>
                            <div className="flex items-center justify-center space-x-3 px-4 py-3">
                                <button
                                    type="button"
                                    onClick={handleCancelReturn}
                                    className="px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProcessReturn}
                                    className="px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Confirm Return'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                                Success!
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    {successMessage}
                                </p>
                            </div>
                            <div className="flex items-center justify-center px-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        setSuccessMessage('');
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
