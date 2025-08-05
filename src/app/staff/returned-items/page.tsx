'use client';

import { useState, useEffect } from 'react';

import { MagnifyingGlassIcon, XMarkIcon, EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Copy, FileText, FileSpreadsheet, FileDown, Printer } from 'lucide-react';

interface ReturnedItem {
    id: number;
    borrow_id: number;
    member_id: number;
    item_id: number;
    room_id: number | null;
    r_date_returned: string;
    r_quantity: number;
    r_condition: string | null;
    r_notes: string | null;
    r_late_fee: number;
    r_damage_fee: number;
    createdAt: string;
    Borrow: {
        b_date_borrowed: string;
        b_due_date: string;
        b_quantity: number;
    };
    Item: {
        i_model: string;
        i_deviceID: string;
        i_brand: string;
    };
    Member: {
        m_fname: string;
        m_lname: string;
        m_school_id: string;
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

export default function StaffReturnedItemsPage() {
    const [returnedItems, setReturnedItems] = useState<ReturnedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedItem, setSelectedItem] = useState<ReturnedItem | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchReturnedItems();
    }, [pagination.page, search]);

    const fetchReturnedItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/returns?page=${pagination.page}&limit=${pagination.limit}&search=${search}`
            );

            const data = await response.json();
            if (data.success) {
                setReturnedItems(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching returned items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchReturnedItems();
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleViewItem = (item: ReturnedItem) => {
        setSelectedItem(item);
        setShowViewModal(true);
    };

    // Export Functions
    const handleCopyData = async () => {
        try {
            const tableData = returnedItems.map(item => ({
                'Device ID': item.Item.i_deviceID,
                'Item Model': item.Item.i_model,
                'Brand': item.Item.i_brand,
                'Borrower': `${item.Member.m_fname} ${item.Member.m_lname}`,
                'Room': item.Room ? item.Room.r_name : 'N/A',
                'Quantity': item.r_quantity,
                'Date Borrowed': new Date(item.Borrow.b_date_borrowed).toLocaleDateString(),
                'Due Date': new Date(item.Borrow.b_due_date).toLocaleDateString(),
                'Date Returned': new Date(item.r_date_returned).toLocaleDateString(),
                'Condition': item.r_condition || 'N/A',
                'Late Fee': item.r_late_fee > 0 ? `$${item.r_late_fee}` : '$0.00',
                'Damage Fee': item.r_damage_fee > 0 ? `$${item.r_damage_fee}` : '$0.00'
            }));

            const headers = Object.keys(tableData[0] || {});
            const csvContent = [
                headers.join('\t'),
                ...tableData.map(row => headers.map(header => row[header as keyof typeof row]).join('\t'))
            ].join('\n');

            await navigator.clipboard.writeText(csvContent);
            setSuccessMessage('Returned items data has been copied to clipboard');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error copying data:', error);
            alert('Failed to copy data to clipboard');
        }
    };

    const handleExportCSV = () => {
        try {
            const tableData = returnedItems.map(item => ({
                'Device ID': item.Item.i_deviceID,
                'Item Model': item.Item.i_model,
                'Brand': item.Item.i_brand,
                'Borrower': `${item.Member.m_fname} ${item.Member.m_lname}`,
                'Room': item.Room ? item.Room.r_name : 'N/A',
                'Quantity': item.r_quantity,
                'Date Borrowed': new Date(item.Borrow.b_date_borrowed).toLocaleDateString(),
                'Due Date': new Date(item.Borrow.b_due_date).toLocaleDateString(),
                'Date Returned': new Date(item.r_date_returned).toLocaleDateString(),
                'Condition': item.r_condition || 'N/A',
                'Late Fee': item.r_late_fee > 0 ? `$${item.r_late_fee}` : '$0.00',
                'Damage Fee': item.r_damage_fee > 0 ? `$${item.r_damage_fee}` : '$0.00'
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
            link.setAttribute('download', `returned_items_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccessMessage('Returned items data has been exported as CSV file');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export CSV file');
        }
    };

    const handleExportExcel = () => {
        try {
            const tableData = returnedItems.map(item => ({
                'Device ID': item.Item.i_deviceID,
                'Item Model': item.Item.i_model,
                'Brand': item.Item.i_brand,
                'Borrower': `${item.Member.m_fname} ${item.Member.m_lname}`,
                'Room': item.Room ? item.Room.r_name : 'N/A',
                'Quantity': item.r_quantity,
                'Date Borrowed': new Date(item.Borrow.b_date_borrowed).toLocaleDateString(),
                'Due Date': new Date(item.Borrow.b_due_date).toLocaleDateString(),
                'Date Returned': new Date(item.r_date_returned).toLocaleDateString(),
                'Condition': item.r_condition || 'N/A',
                'Late Fee': item.r_late_fee > 0 ? `$${item.r_late_fee}` : '$0.00',
                'Damage Fee': item.r_damage_fee > 0 ? `$${item.r_damage_fee}` : '$0.00'
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
            link.setAttribute('download', `returned_items_${new Date().toISOString().split('T')[0]}.xls`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccessMessage('Returned items data has been exported as Excel file');
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

            const tableRows = returnedItems.map(item => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${item.Item.i_deviceID}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${item.Item.i_model}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${item.Member.m_fname} ${item.Member.m_lname}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${item.Room ? item.Room.r_name : 'N/A'}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${item.r_quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${new Date(item.Borrow.b_date_borrowed).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${new Date(item.r_date_returned).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; font-size: 10px;">${item.r_condition || 'N/A'}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Returned Items Report - ${new Date().toLocaleDateString()}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #333; text-align: center; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { background-color: #f8f9fa; border: 1px solid #ddd; padding: 8px; font-size: 10px; font-weight: bold; }
                            @media print { 
                                body { margin: 0; }
                                table { font-size: 8px; }
                                th, td { padding: 3px; }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Returned Items Report</h1>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Items:</strong> ${returnedItems.length}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Device ID</th>
                                    <th>Item Model</th>
                                    <th>Borrower</th>
                                    <th>Room</th>
                                    <th>Quantity</th>
                                    <th>Date Borrowed</th>
                                    <th>Date Returned</th>
                                    <th>Condition</th>
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

            const tableRows = returnedItems.map(item => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.Item.i_deviceID}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.Item.i_model}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.Member.m_fname} ${item.Member.m_lname}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.Room ? item.Room.r_name : 'N/A'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.r_quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.Borrow.b_date_borrowed).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.r_date_returned).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.r_condition || 'N/A'}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Returned Items Report - ${new Date().toLocaleDateString()}</title>
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
                        <h1>Returned Items Report</h1>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Items:</strong> ${returnedItems.length}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Device ID</th>
                                    <th>Item Model</th>
                                    <th>Borrower</th>
                                    <th>Room</th>
                                    <th>Quantity</th>
                                    <th>Date Borrowed</th>
                                    <th>Date Returned</th>
                                    <th>Condition</th>
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

    const wasOverdue = (borrowedDate: string, dueDate: string, returnedDate: string) => {
        return new Date(returnedDate) > new Date(dueDate);
    };

    const getConditionColor = (condition: string | null) => {
        switch (condition?.toLowerCase()) {
            case 'good':
                return 'bg-green-100 text-green-800';
            case 'fair':
                return 'bg-yellow-100 text-yellow-800';
            case 'damaged':
                return 'bg-red-100 text-red-800';
            case 'lost':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Returned Items</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        View and manage all returned items from the school inventory.
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
                                    placeholder="Search returned items by device ID, model, or borrower name..."
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

            {/* Returned Items Table */}
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
                                            Date Returned
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Condition
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fees
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {returnedItems.map((item) => {
                                        const overdue = wasOverdue(item.Borrow.b_date_borrowed, item.Borrow.b_due_date, item.r_date_returned);
                                        const totalFees = (item.r_late_fee || 0) + (item.r_damage_fee || 0);

                                        return (
                                            <tr key={item.id} className={`hover:bg-gray-50 ${overdue ? 'bg-yellow-50' : ''}`}>
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
                                                    {item.r_quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>
                                                        {new Date(item.r_date_returned).toLocaleDateString()}
                                                        {overdue && (
                                                            <div className="text-xs text-orange-600">
                                                                (Returned Late)
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.r_condition)}`}>
                                                        {item.r_condition || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {totalFees > 0 ? (
                                                        <div className="text-red-600 font-medium">
                                                            ${totalFees.toFixed(2)}
                                                            {item.r_late_fee > 0 && (
                                                                <div className="text-xs">Late: ${item.r_late_fee.toFixed(2)}</div>
                                                            )}
                                                            {item.r_damage_fee > 0 && (
                                                                <div className="text-xs">Damage: ${item.r_damage_fee.toFixed(2)}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-green-600">$0.00</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleViewItem(item)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {returnedItems.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-sm text-gray-500">No returned items found.</p>
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
                                <h3 className="text-lg font-medium text-gray-900">Returned Item Details</h3>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                        <p className="text-sm text-gray-900">{selectedItem.Item.i_brand}</p>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Returned</label>
                                        <p className="text-sm text-gray-900">{selectedItem.r_quantity}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Borrowed</label>
                                        <p className="text-sm text-gray-900">{new Date(selectedItem.Borrow.b_date_borrowed).toLocaleDateString()}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                        <p className="text-sm text-gray-900">{new Date(selectedItem.Borrow.b_due_date).toLocaleDateString()}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Returned</label>
                                        <p className={`text-sm ${wasOverdue(selectedItem.Borrow.b_date_borrowed, selectedItem.Borrow.b_due_date, selectedItem.r_date_returned) ? 'text-orange-600 font-semibold' : 'text-gray-900'}`}>
                                            {new Date(selectedItem.r_date_returned).toLocaleDateString()}
                                            {wasOverdue(selectedItem.Borrow.b_date_borrowed, selectedItem.Borrow.b_due_date, selectedItem.r_date_returned) && ' (Late Return)'}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(selectedItem.r_condition)}`}>
                                            {selectedItem.r_condition || 'N/A'}
                                        </span>
                                    </div>

                                    {(selectedItem.r_late_fee > 0 || selectedItem.r_damage_fee > 0) && (
                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fees</label>
                                            <div className="space-y-1">
                                                {selectedItem.r_late_fee > 0 && (
                                                    <p className="text-sm text-red-600">Late Fee: ${selectedItem.r_late_fee.toFixed(2)}</p>
                                                )}
                                                {selectedItem.r_damage_fee > 0 && (
                                                    <p className="text-sm text-red-600">Damage Fee: ${selectedItem.r_damage_fee.toFixed(2)}</p>
                                                )}
                                                <p className="text-sm font-semibold text-red-700">
                                                    Total: ${((selectedItem.r_late_fee || 0) + (selectedItem.r_damage_fee || 0)).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedItem.r_notes && (
                                        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Return Notes</label>
                                            <p className="text-sm text-gray-900">{selectedItem.r_notes}</p>
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
                                </div>
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
