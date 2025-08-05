'use client';

import { useState, useEffect } from 'react';

import { PlusIcon, MagnifyingGlassIcon, XMarkIcon, PencilIcon, EyeIcon, UserMinusIcon, UserPlusIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Copy, FileText, FileSpreadsheet, FileDown, Printer } from 'lucide-react';
import Layout from '../Layout';

interface Borrower {
    id: number;
    m_school_id: string;
    m_fname: string;
    m_lname: string;
    m_contact: string;
    m_department: string;
    m_type: number;
    m_status: number;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function BorrowersPage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        borrower: Borrower;
        newStatus: number;
        actionText: string;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [formData, setFormData] = useState({
        m_fname: '',
        m_lname: '',
        m_mname: '',
        m_contact: '',
        m_address: '',
        m_type: 'Student'
    });
    const [editFormData, setEditFormData] = useState({
        id: 0,
        m_fname: '',
        m_lname: '',
        m_mname: '',
        m_contact: '',
        m_address: '',
        m_type: 'Student'
    });

    useEffect(() => {
        fetchBorrowers();
    }, [pagination.page, search]);

    const fetchBorrowers = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/borrowers?page=${pagination.page}&limit=${pagination.limit}&search=${search}`
            );

            const data = await response.json();
            if (data.success) {
                setBorrowers(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching borrowers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchBorrowers();
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/borrowers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setShowAddModal(false);
                setFormData({
                    m_fname: '',
                    m_lname: '',
                    m_mname: '',
                    m_contact: '',
                    m_address: '',
                    m_type: 'Student'
                });
                fetchBorrowers(); // Refresh the list
                setSuccessMessage('Borrower added successfully!');
                setShowSuccessModal(true);
            } else {
                alert('Error adding borrower: ' + data.error);
            }
        } catch (error) {
            console.error('Error adding borrower:', error);
            alert('Error adding borrower');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewProfile = (borrower: Borrower) => {
        setSelectedBorrower(borrower);
        setShowViewModal(true);
    };

    const handleEdit = (borrower: Borrower) => {
        const getTypeString = (type: number) => {
            switch (type) {
                case 1: return 'Student';
                case 2: return 'Faculty';
                case 3: return 'Staff';
                default: return 'Student';
            }
        };

        setEditFormData({
            id: borrower.id,
            m_fname: borrower.m_fname,
            m_lname: borrower.m_lname,
            m_mname: '',
            m_contact: borrower.m_contact,
            m_address: borrower.m_department,
            m_type: getTypeString(borrower.m_type)
        });
        setSelectedBorrower(borrower);
        setShowEditModal(true);
    };

    const handleToggleStatus = (borrower: Borrower) => {
        const newStatus = borrower.m_status === 1 ? 2 : 1;
        const actionText = newStatus === 1 ? 'activate' : 'deactivate';

        setConfirmAction({
            borrower,
            newStatus,
            actionText
        });
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        try {
            setSubmitting(true);
            const response = await fetch(`/api/borrowers/${confirmAction.borrower.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ m_status: confirmAction.newStatus })
            });

            const data = await response.json();
            if (data.success) {
                fetchBorrowers(); // Refresh the list
                setSuccessMessage(`Borrower ${confirmAction.actionText}d successfully!`);
                setShowSuccessModal(true);
            } else {
                alert(`Error ${confirmAction.actionText}ing borrower: ` + data.error);
            }
        } catch (error) {
            console.error(`Error ${confirmAction.actionText}ing borrower:`, error);
            alert(`Error ${confirmAction.actionText}ing borrower`);
        } finally {
            setSubmitting(false);
            setShowConfirmModal(false);
            setConfirmAction(null);
        }
    };

    const handleCancelAction = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(`/api/borrowers/${editFormData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });

            const data = await response.json();
            if (data.success) {
                setShowEditModal(false);
                setEditFormData({
                    id: 0,
                    m_fname: '',
                    m_lname: '',
                    m_mname: '',
                    m_contact: '',
                    m_address: '',
                    m_type: 'Student'
                });
                setSelectedBorrower(null);
                fetchBorrowers(); // Refresh the list
                setSuccessMessage('Borrower updated successfully!');
                setShowSuccessModal(true);
            } else {
                alert('Error updating borrower: ' + data.error);
            }
        } catch (error) {
            console.error('Error updating borrower:', error);
            alert('Error updating borrower');
        } finally {
            setSubmitting(false);
        }
    };

    // Export Functions
    const handleCopyData = async () => {
        try {
            const getTypeString = (type: number) => {
                switch (type) {
                    case 1: return 'Student';
                    case 2: return 'Faculty';
                    case 3: return 'Staff';
                    default: return 'Unknown';
                }
            };

            const tableData = borrowers.map(borrower => ({
                'School ID': borrower.m_school_id,
                'Name': `${borrower.m_fname} ${borrower.m_lname}`,
                'Contact': borrower.m_contact,
                'Department': borrower.m_department,
                'Type': getTypeString(borrower.m_type),
                'Status': borrower.m_status === 1 ? 'Active' : 'Inactive',
                'Joined': borrower.createdAt ? new Date(borrower.createdAt).toLocaleDateString() : 'N/A'
            }));

            const headers = Object.keys(tableData[0] || {});
            const csvContent = [
                headers.join('\t'),
                ...tableData.map(row => headers.map(header => row[header as keyof typeof row]).join('\t'))
            ].join('\n');

            await navigator.clipboard.writeText(csvContent);
            setSuccessMessage('Borrowers data has been copied to clipboard');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error copying data:', error);
            alert('Failed to copy data to clipboard');
        }
    };

    const handleExportCSV = () => {
        try {
            const getTypeString = (type: number) => {
                switch (type) {
                    case 1: return 'Student';
                    case 2: return 'Faculty';
                    case 3: return 'Staff';
                    default: return 'Unknown';
                }
            };

            const tableData = borrowers.map(borrower => ({
                'School ID': borrower.m_school_id,
                'Name': `${borrower.m_fname} ${borrower.m_lname}`,
                'Contact': borrower.m_contact,
                'Department': borrower.m_department || '',
                'Type': getTypeString(borrower.m_type),
                'Status': borrower.m_status === 1 ? 'Active' : 'Inactive',
                'Joined': borrower.createdAt ? new Date(borrower.createdAt).toLocaleDateString() : ''
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
            link.setAttribute('download', `borrowers_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccessMessage('Borrowers data has been exported as CSV file');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export CSV file');
        }
    };

    const handleExportExcel = () => {
        try {
            const getTypeString = (type: number) => {
                switch (type) {
                    case 1: return 'Student';
                    case 2: return 'Faculty';
                    case 3: return 'Staff';
                    default: return 'Unknown';
                }
            };

            const tableData = borrowers.map(borrower => ({
                'School ID': borrower.m_school_id,
                'Name': `${borrower.m_fname} ${borrower.m_lname}`,
                'Contact': borrower.m_contact,
                'Department': borrower.m_department || '',
                'Type': getTypeString(borrower.m_type),
                'Status': borrower.m_status === 1 ? 'Active' : 'Inactive',
                'Joined': borrower.createdAt ? new Date(borrower.createdAt).toLocaleDateString() : ''
            }));

            // Create a simple Excel-compatible format (Tab-separated values with .xls extension)
            const headers = Object.keys(tableData[0] || {});
            const excelContent = [
                headers.join('\t'),
                ...tableData.map(row => headers.map(header => row[header as keyof typeof row]).join('\t'))
            ].join('\n');

            const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `borrowers_${new Date().toISOString().split('T')[0]}.xls`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccessMessage('Borrowers data has been exported as Excel file');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Failed to export Excel file');
        }
    };

    const handleExportPDF = () => {
        try {
            const getTypeString = (type: number) => {
                switch (type) {
                    case 1: return 'Student';
                    case 2: return 'Faculty';
                    case 3: return 'Staff';
                    default: return 'Unknown';
                }
            };

            // Create a printable table for PDF
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow popups to export PDF');
                return;
            }

            const tableRows = borrowers.map(borrower => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${borrower.m_school_id}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${borrower.m_fname} ${borrower.m_lname}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${borrower.m_contact}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${borrower.m_department || 'N/A'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${getTypeString(borrower.m_type)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${borrower.m_status === 1 ? 'Active' : 'Inactive'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${borrower.createdAt ? new Date(borrower.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Borrowers Report - ${new Date().toLocaleDateString()}</title>
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
                        <h1>School Borrowers Report</h1>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Borrowers:</strong> ${borrowers.length}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>School ID</th>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Department</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Joined</th>
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
            const getTypeString = (type: number) => {
                switch (type) {
                    case 1: return 'Student';
                    case 2: return 'Faculty';
                    case 3: return 'Staff';
                    default: return 'Unknown';
                }
            };

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow popups to print');
                return;
            }

            const tableRows = borrowers.map(borrower => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${borrower.m_school_id}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${borrower.m_fname} ${borrower.m_lname}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${borrower.m_contact}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${borrower.m_department || 'N/A'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${getTypeString(borrower.m_type)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${borrower.m_status === 1 ? 'Active' : 'Inactive'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${borrower.createdAt ? new Date(borrower.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Borrowers Report - ${new Date().toLocaleDateString()}</title>
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
                        <h1>School Borrowers Report</h1>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total Borrowers:</strong> ${borrowers.length}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>School ID</th>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Department</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Joined</th>
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

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Borrowers</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage school borrowers including students, faculty, and staff.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Add Borrower
                        </button>
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
                                        placeholder="Search borrowers by name, contact, or type..."
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

                {/* Borrowers Table */}
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
                                                School ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {borrowers.map((borrower) => {
                                            const getTypeString = (type: number) => {
                                                switch (type) {
                                                    case 1: return 'Student';
                                                    case 2: return 'Faculty';
                                                    case 3: return 'Staff';
                                                    default: return 'Unknown';
                                                }
                                            };

                                            const typeString = getTypeString(borrower.m_type);

                                            return (
                                                <tr key={borrower.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                        {borrower.m_school_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {`${borrower.m_fname} ${borrower.m_lname}`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {borrower.m_contact}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {borrower.m_department}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeString === 'Student'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : typeString === 'Faculty'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-purple-100 text-purple-800'
                                                            }`}>
                                                            {typeString}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${borrower.m_status === 1
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {borrower.m_status === 1 ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {borrower.createdAt ? new Date(borrower.createdAt).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleViewProfile(borrower)}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                                                                title="View Profile"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(borrower)}
                                                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-100"
                                                                title="Edit"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(borrower)}
                                                                className={`p-1 rounded-full ${borrower.m_status === 1
                                                                    ? 'text-red-600 hover:text-red-900 hover:bg-red-100'
                                                                    : 'text-green-600 hover:text-green-900 hover:bg-green-100'
                                                                    }`}
                                                                title={borrower.m_status === 1 ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {borrower.m_status === 1 ? (
                                                                    <UserMinusIcon className="h-4 w-4" />
                                                                ) : (
                                                                    <UserPlusIcon className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {borrowers.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-sm text-gray-500">No borrowers found.</p>
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

                {/* Add Borrower Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
                        <div className="fixed top-0 right-0 h-full w-11/12 md:w-2/5 lg:w-1/3 p-5 shadow-lg bg-white overflow-y-auto">
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Add New Borrower</h3>
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
                                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                name="m_fname"
                                                value={formData.m_fname}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter first name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                            <input
                                                type="text"
                                                name="m_lname"
                                                value={formData.m_lname}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter last name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                            <input
                                                type="text"
                                                name="m_mname"
                                                value={formData.m_mname}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter middle name (optional)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                            <input
                                                type="text"
                                                name="m_contact"
                                                value={formData.m_contact}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter contact number"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <input
                                                type="text"
                                                name="m_address"
                                                value={formData.m_address}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter address"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Borrower Type</label>
                                            <select
                                                name="m_type"
                                                value={formData.m_type}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Faculty">Faculty</option>
                                                <option value="Staff">Staff</option>
                                            </select>
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
                                            {submitting ? 'Adding...' : 'Add Borrower'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Borrower Modal */}
                {showEditModal && selectedBorrower && (
                    <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Edit Borrower</h3>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedBorrower(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                name="m_fname"
                                                value={editFormData.m_fname}
                                                onChange={handleEditInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter first name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                            <input
                                                type="text"
                                                name="m_lname"
                                                value={editFormData.m_lname}
                                                onChange={handleEditInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter last name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                            <input
                                                type="text"
                                                name="m_mname"
                                                value={editFormData.m_mname}
                                                onChange={handleEditInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter middle name (optional)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                            <input
                                                type="text"
                                                name="m_contact"
                                                value={editFormData.m_contact}
                                                onChange={handleEditInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter contact number"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <input
                                                type="text"
                                                name="m_address"
                                                value={editFormData.m_address}
                                                onChange={handleEditInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter address"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Borrower Type</label>
                                            <select
                                                name="m_type"
                                                value={editFormData.m_type}
                                                onChange={handleEditInputChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Faculty">Faculty</option>
                                                <option value="Staff">Staff</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setSelectedBorrower(null);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {submitting ? 'Updating...' : 'Update Borrower'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Profile Modal */}
                {showViewModal && selectedBorrower && (
                    <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Borrower Profile</h3>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            setSelectedBorrower(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">School ID</label>
                                            <p className="text-sm text-blue-600 font-medium">{selectedBorrower.m_school_id}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <p className="text-sm text-gray-900 font-medium">{`${selectedBorrower.m_fname} ${selectedBorrower.m_lname}`}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                            <p className="text-sm text-gray-900">{selectedBorrower.m_contact}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <p className="text-sm text-gray-900">{selectedBorrower.m_department}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Type</label>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedBorrower.m_type === 1
                                                ? 'bg-blue-100 text-blue-800'
                                                : selectedBorrower.m_type === 2
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {selectedBorrower.m_type === 1 ? 'Student' : selectedBorrower.m_type === 2 ? 'Faculty' : 'Staff'}
                                            </span>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedBorrower.m_status === 1
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {selectedBorrower.m_status === 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedBorrower.createdAt ? new Date(selectedBorrower.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowViewModal(false);
                                                setSelectedBorrower(null);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowViewModal(false);
                                                handleEdit(selectedBorrower);
                                            }}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Edit Borrower
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {showConfirmModal && confirmAction && (
                    <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                                    {confirmAction.actionText === 'activate' ? 'Activate Borrower' : 'Deactivate Borrower'}
                                </h3>
                                <div className="mt-2 px-7 py-3">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to {confirmAction.actionText}{' '}
                                        <span className="font-medium text-gray-900">
                                            {confirmAction.borrower.m_fname} {confirmAction.borrower.m_lname}
                                        </span>?
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        This will {confirmAction.actionText === 'activate' ? 'restore their access' : 'prevent them from borrowing items'}.
                                    </p>
                                </div>
                                <div className="flex items-center justify-center space-x-3 px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={handleCancelAction}
                                        className="px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmAction}
                                        className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${confirmAction.actionText === 'activate'
                                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                            }`}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {confirmAction.actionText === 'activate' ? 'Activating...' : 'Deactivating...'}
                                            </div>
                                        ) : (
                                            `${confirmAction.actionText === 'activate' ? 'Activate' : 'Deactivate'}`
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
        </Layout>
    );
}
