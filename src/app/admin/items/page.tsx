'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Info, Copy, FileText, FileSpreadsheet, FileDown, Printer } from 'lucide-react';
import Layout from '../Layout';

interface Item {
  id: number;
  i_deviceID: string;
  i_model: string;
  i_category: string;
  i_brand: string;
  i_description: string;
  i_type: string;
  item_rawstock: number;
  i_status: number;
  i_mr: string;
  i_price: number;
  i_photo: string;
  no_of_items?: number;
  remarks?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [formData, setFormData] = useState({
    i_deviceID: '',
    i_model: '',
    i_category: '',
    i_brand: '',
    i_description: '',
    i_type: '',
    item_rawstock: '',
    i_mr: '',
    i_price: '',
    i_status: '1'
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState('');
  const [editFormData, setEditFormData] = useState({
    i_deviceID: '',
    i_model: '',
    i_category: '',
    i_brand: '',
    i_description: '',
    i_type: '',
    item_rawstock: '',
    i_mr: '',
    i_price: '',
    i_status: '1'
  });
  const [statusFormData, setStatusFormData] = useState({
    i_status: '1',
    no_of_items: '',
    remarks: ''
  });

  useEffect(() => {
    fetchItems();
  }, [pagination.page, search]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/items?page=${pagination.page}&limit=${pagination.limit}&search=${search}`
      );

      const data = await response.json();
      if (data.success) {
        setItems(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchItems();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Invalid file type', 'Please select an image file.');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showNotification('error', 'File too large', 'Please select an image smaller than 5MB.');
        return;
      }

      setSelectedPhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!selectedPhoto) return null;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedPhoto);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.filename;
      } else {
        showNotification('error', 'Upload failed', data.error || 'Failed to upload photo');
        return null;
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      showNotification('error', 'Upload failed', 'An error occurred while uploading the photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload photo first if selected
      let photoFilename = 'default.jpg';
      if (selectedPhoto) {
        const uploadedFilename = await uploadPhoto();
        if (uploadedFilename) {
          photoFilename = uploadedFilename;
        } else {
          // Photo upload failed, don't proceed with item creation
          setSubmitting(false);
          return;
        }
      }

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          item_rawstock: parseInt(formData.item_rawstock),
          i_price: parseFloat(formData.i_price),
          i_photo: photoFilename
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          i_deviceID: '',
          i_model: '',
          i_category: '',
          i_brand: '',
          i_description: '',
          i_type: '',
          item_rawstock: '',
          i_mr: '',
          i_price: '',
          i_status: '1'
        });
        setSelectedPhoto(null);
        setPhotoPreview(null);
        fetchItems(); // Refresh the list
        showNotification('success', 'Success!', `Item "${formData.i_model}" has been added successfully to the inventory.`);
      } else {
        showNotification('error', 'Error', data.error || 'Failed to add item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('error', 'Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (itemId: number, newStatus: number) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ i_status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, i_status: newStatus } : item
        ));
        setSelectedItem(prev => prev ? { ...prev, i_status: newStatus } : null);
        showNotification('success', 'Status Updated', `Item status changed to ${newStatus === 1 ? 'New' : 'Old'}`);
      } else {
        showNotification('error', 'Error', data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('error', 'Error', 'An unexpected error occurred');
    }
  };

  const handleAddQuantity = async () => {
    if (!selectedItem || !quantityToAdd) return;

    try {
      const newStock = selectedItem.item_rawstock + parseInt(quantityToAdd);
      const response = await fetch(`/api/items/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item_rawstock: newStock })
      });

      const data = await response.json();
      if (data.success) {
        setItems(prev => prev.map(item =>
          item.id === selectedItem.id ? { ...item, item_rawstock: newStock } : item
        ));
        setSelectedItem(prev => prev ? { ...prev, item_rawstock: newStock } : null);
        setShowQuantityModal(false);
        setQuantityToAdd('');
        showNotification('success', 'Quantity Added', `Added ${quantityToAdd} units to inventory`);
      } else {
        showNotification('error', 'Error', data.error || 'Failed to add quantity');
      }
    } catch (error) {
      console.error('Error adding quantity:', error);
      showNotification('error', 'Error', 'An unexpected error occurred');
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/items/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editFormData,
          item_rawstock: parseInt(editFormData.item_rawstock),
          i_price: parseFloat(editFormData.i_price),
          i_status: parseInt(editFormData.i_status)
        })
      });

      const data = await response.json();
      if (data.success) {
        const updatedItem = {
          ...selectedItem,
          ...editFormData,
          item_rawstock: parseInt(editFormData.item_rawstock),
          i_price: parseFloat(editFormData.i_price),
          i_status: parseInt(editFormData.i_status)
        };

        setItems(prev => prev.map(item =>
          item.id === selectedItem.id ? updatedItem : item
        ));
        setSelectedItem(updatedItem);
        setShowEditModal(false);
        showNotification('success', 'Item Updated', 'Item details have been updated successfully');
      } else {
        showNotification('error', 'Error', data.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('error', 'Error', 'An unexpected error occurred');
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStatusFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusUpdate = async () => {
    if (!selectedItem) return;

    try {
      const updateData = {
        i_status: parseInt(statusFormData.i_status),
        no_of_items: statusFormData.no_of_items ? parseInt(statusFormData.no_of_items) : null,
        remarks: statusFormData.remarks || null
      };

      const response = await fetch(`/api/items/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (data.success) {
        const updatedItem = {
          ...selectedItem,
          i_status: parseInt(statusFormData.i_status),
          no_of_items: statusFormData.no_of_items ? parseInt(statusFormData.no_of_items) : undefined,
          remarks: statusFormData.remarks || undefined
        };

        setItems(prev => prev.map(item =>
          item.id === selectedItem.id ? updatedItem : item
        ));
        setSelectedItem(updatedItem);
        setShowStatusModal(false);
        showNotification('success', 'Status Updated', `Item status updated successfully`);
      } else {
        showNotification('error', 'Error', data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('error', 'Error', 'An unexpected error occurred');
    }
  };

  // Export Functions
  const handleCopyData = async () => {
    try {
      const tableData = items.map(item => ({
        'Device ID': item.i_deviceID,
        'Model': item.i_model,
        'Category': item.i_category,
        'Brand': item.i_brand,
        'Type': item.i_type,
        'Stock': item.item_rawstock,
        'Price': `₱${item.i_price}`,
        'Status': item.i_status === 1 ? 'New' : 'Old',
        'MR Number': item.i_mr || 'N/A',
        'Description': item.i_description || 'N/A'
      }));

      const headers = Object.keys(tableData[0] || {});
      const csvContent = [
        headers.join('\t'),
        ...tableData.map(row => headers.map(header => row[header as keyof typeof row]).join('\t'))
      ].join('\n');

      await navigator.clipboard.writeText(csvContent);
      showNotification('success', 'Data Copied', 'Items data has been copied to clipboard');
    } catch (error) {
      console.error('Error copying data:', error);
      showNotification('error', 'Error', 'Failed to copy data to clipboard');
    }
  };

  const handleExportCSV = () => {
    try {
      const tableData = items.map(item => ({
        'Device ID': item.i_deviceID,
        'Model': item.i_model,
        'Category': item.i_category,
        'Brand': item.i_brand,
        'Type': item.i_type,
        'Stock': item.item_rawstock,
        'Price': item.i_price,
        'Status': item.i_status === 1 ? 'New' : 'Old',
        'MR Number': item.i_mr || '',
        'Description': item.i_description || ''
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
      link.setAttribute('download', `items_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('success', 'CSV Exported', 'Items data has been exported as CSV file');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showNotification('error', 'Error', 'Failed to export CSV file');
    }
  };

  const handleExportExcel = () => {
    try {
      const tableData = items.map(item => ({
        'Device ID': item.i_deviceID,
        'Model': item.i_model,
        'Category': item.i_category,
        'Brand': item.i_brand,
        'Type': item.i_type,
        'Stock': item.item_rawstock,
        'Price': item.i_price,
        'Status': item.i_status === 1 ? 'New' : 'Old',
        'MR Number': item.i_mr || '',
        'Description': item.i_description || ''
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
      link.setAttribute('download', `items_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('success', 'Excel Exported', 'Items data has been exported as Excel file');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showNotification('error', 'Error', 'Failed to export Excel file');
    }
  };

  const handleExportPDF = () => {
    try {
      // Create a printable table for PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showNotification('error', 'Error', 'Please allow popups to export PDF');
        return;
      }

      const tableRows = items.map(item => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.i_deviceID}</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.i_model}</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.i_category}</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.i_brand}</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.i_type}</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.item_rawstock}</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">₱${item.i_price}</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.i_status === 1 ? 'New' : 'Old'}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Items Report - ${new Date().toLocaleDateString()}</title>
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
            <h1>School Items Inventory Report</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Items:</strong> ${items.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Model</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Type</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
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
        showNotification('success', 'PDF Ready', 'PDF document is ready for printing/saving');
      }, 250);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showNotification('error', 'Error', 'Failed to export PDF');
    }
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showNotification('error', 'Error', 'Please allow popups to print');
        return;
      }

      const tableRows = items.map(item => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.i_deviceID}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.i_model}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.i_category}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.i_brand}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.i_type}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.item_rawstock}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₱${item.i_price}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.i_status === 1 ? 'New' : 'Old'}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Items Report - ${new Date().toLocaleDateString()}</title>
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
            <h1>School Items Inventory Report</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Items:</strong> ${items.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Model</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Type</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
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
        showNotification('success', 'Print Ready', 'Print dialog has been opened');
      }, 250);
    } catch (error) {
      console.error('Error printing:', error);
      showNotification('error', 'Error', 'Failed to open print dialog');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Breadcrumb */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <HomeIcon className="h-4 w-4 text-gray-400" />
            <span>/</span>
            <span className="text-gray-700 font-medium">Items</span>
            {showDetailModal && (
              <>
                <span>/</span>
                <span className="text-gray-700 font-medium">More Details</span>
              </>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Item
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
                    placeholder="Search items by model, category, brand..."
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

        {/* Items Table */}
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
                        Photo
                      </th>
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
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-20 w-20 flex-shrink-0">
                            <img
                              className="h-20 w-20 rounded-md object-cover border border-gray-300"
                              src={item.i_photo && item.i_photo !== 'default.jpg'
                                ? `/uploads/items/${item.i_photo}`
                                : '/uploads/items/default.jpg'}
                              alt={item.i_model}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/uploads/items/default.jpg';
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.i_deviceID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.i_model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.i_category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.i_brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.item_rawstock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₱{item.i_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.i_status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {item.i_status === 1 ? 'New' : 'Old'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDetailModal(true);
                            }}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="More Info"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            More Info
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {items.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">No items found.</p>
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

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
            <div className="fixed top-0 right-0 h-full w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 p-5 shadow-lg bg-white overflow-y-auto">
              <div className="mt-3">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Item</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Device ID</label>
                      <input
                        type="text"
                        name="i_deviceID"
                        value={formData.i_deviceID}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model</label>
                      <input
                        type="text"
                        name="i_model"
                        value={formData.i_model}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <input
                        type="text"
                        name="i_category"
                        value={formData.i_category}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        name="i_brand"
                        value={formData.i_brand}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <input
                        type="text"
                        name="i_type"
                        value={formData.i_type}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                      <input
                        type="number"
                        name="item_rawstock"
                        value={formData.item_rawstock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">MR Number</label>
                      <input
                        type="text"
                        name="i_mr"
                        value={formData.i_mr}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="number"
                        name="i_price"
                        value={formData.i_price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="i_status"
                        value={formData.i_status}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">New</option>
                        <option value="0">Old</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="i_description"
                      value={formData.i_description}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Photo Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device Photo</label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                      {photoPreview && (
                        <div className="flex-shrink-0">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded-md border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || uploadingPhoto}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {uploadingPhoto ? 'Uploading Photo...' : submitting ? 'Adding...' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Item Detail Modal */}
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
            <div className="fixed top-0 right-0 h-full w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 p-5 shadow-lg bg-white overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
                </div>

                <div className="space-y-6">
                  {/* Item Photo */}
                  <div className="flex justify-center">
                    <div className="h-48 w-48 flex-shrink-0">
                      <img
                        className="h-48 w-48 rounded-lg object-cover border border-gray-300 shadow-md"
                        src={selectedItem.i_photo && selectedItem.i_photo !== 'default.jpg'
                          ? `/uploads/items/${selectedItem.i_photo}`
                          : '/uploads/items/default.jpg'}
                        alt={selectedItem.i_model}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/uploads/items/default.jpg';
                        }}
                      />
                    </div>
                  </div>

                  {/* Item Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Device ID</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedItem.i_deviceID}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedItem.i_model}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedItem.i_category}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedItem.i_brand}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedItem.i_type}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedItem.item_rawstock}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">MR Number</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedItem.i_mr || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">₱{selectedItem.i_price}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${selectedItem.i_status === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {selectedItem.i_status === 1 ? 'New' : 'Old'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Item ID</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">#{selectedItem.id}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md min-h-[60px]">
                      {selectedItem.i_description || 'No description available.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedItem(null);
                      }}
                      className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Close
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowQuantityModal(true);
                          setQuantityToAdd('');
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Add Quantity
                      </button>
                      <button
                        onClick={() => {
                          setEditFormData({
                            i_deviceID: selectedItem.i_deviceID,
                            i_model: selectedItem.i_model,
                            i_category: selectedItem.i_category,
                            i_brand: selectedItem.i_brand,
                            i_description: selectedItem.i_description,
                            i_type: selectedItem.i_type,
                            item_rawstock: selectedItem.item_rawstock.toString(),
                            i_mr: selectedItem.i_mr,
                            i_price: selectedItem.i_price.toString(),
                            i_status: selectedItem.i_status.toString()
                          });
                          setShowEditModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit Item
                      </button>
                      <button
                        onClick={() => {
                          setStatusFormData({
                            i_status: selectedItem.i_status.toString(),
                            no_of_items: selectedItem.no_of_items?.toString() || '',
                            remarks: selectedItem.remarks || ''
                          });
                          setShowStatusModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Change Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Quantity Modal */}
        {showQuantityModal && selectedItem && (
          <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Quantity</h3>
                  <button
                    onClick={() => {
                      setShowQuantityModal(false);
                      setQuantityToAdd('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedItem.item_rawstock} units</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity to Add</label>
                    <input
                      type="number"
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(e.target.value)}
                      min="1"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter quantity to add"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowQuantityModal(false);
                        setQuantityToAdd('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddQuantity}
                      disabled={!quantityToAdd || parseInt(quantityToAdd) <= 0}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      Add Quantity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditModal && selectedItem && (
          <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Item</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Device ID</label>
                      <input
                        type="text"
                        name="i_deviceID"
                        value={editFormData.i_deviceID}
                        onChange={handleEditInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model</label>
                      <input
                        type="text"
                        name="i_model"
                        value={editFormData.i_model}
                        onChange={handleEditInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <input
                        type="text"
                        name="i_category"
                        value={editFormData.i_category}
                        onChange={handleEditInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        name="i_brand"
                        value={editFormData.i_brand}
                        onChange={handleEditInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <input
                        type="text"
                        name="i_type"
                        value={editFormData.i_type}
                        onChange={handleEditInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                      <input
                        type="number"
                        name="item_rawstock"
                        value={editFormData.item_rawstock}
                        onChange={handleEditInputChange}
                        required
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">MR Number</label>
                      <input
                        type="text"
                        name="i_mr"
                        value={editFormData.i_mr}
                        onChange={handleEditInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="number"
                        name="i_price"
                        value={editFormData.i_price}
                        onChange={handleEditInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="i_status"
                        value={editFormData.i_status}
                        onChange={handleEditInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">New</option>
                        <option value="0">Old</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="i_description"
                      value={editFormData.i_description}
                      onChange={handleEditInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditItem}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Update Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Status Modal */}
        {showStatusModal && selectedItem && (
          <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Change Status</h3>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="i_status"
                        value={statusFormData.i_status}
                        onChange={handleStatusInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">New</option>
                        <option value="0">Old</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Number of Items</label>
                      <input
                        type="number"
                        name="no_of_items"
                        value={statusFormData.no_of_items}
                        onChange={handleStatusInputChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter number of items"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                      name="remarks"
                      value={statusFormData.remarks}
                      onChange={handleStatusInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter any remarks about the status change..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
            <div className={`rounded-lg shadow-lg p-4 ${notification.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
              }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {notification.title}
                  </h3>
                  <p className={`mt-1 text-sm ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${notification.type === 'success'
                      ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                      : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                      }`}
                  >
                    <XMarkIcon className="h-4 w-4" />
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
