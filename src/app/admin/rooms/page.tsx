'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import Layout from '../Layout';
import Alert from '../../../components/ui-components/alert';
import { useAlert } from '../../../components/ui-components/useAlert';

interface Room {
  id: number;
  r_name: string;
  r_description?: string;
  r_status: number;
  createdAt: string;
}

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
  room_id?: number;
  borrow_id?: number;
  borrow_quantity?: number;
  date_borrowed?: string;
  due_date?: string;
  borrow_purpose?: string;
  borrow_notes?: string;
  borrow_status?: number;
  borrower?: {
    id: number;
    m_school_id: string;
    m_fname: string;
    m_lname: string;
    m_gender: string;
    m_contact: string;
    m_department: string;
    m_year_section: string;
    m_type: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [formData, setFormData] = useState({
    r_name: '',
    r_description: ''
  });

  // Floor and room options organized by floor
  const floorRoomOptions = {
    "2nd Floor": [
      "Library", "Speech Laboratory", "Clinic", "Fundamental Laboratory", "LRC",
      "Nursing Faculty", "Guidance Office", "Presidents Office", "D21", "D22", "D23"
    ],
    "3rd Floor": [
      "A31", "SHS Faculty", "A35", "A36", "B31", "B32", "C31", "C32",
      "C33", "C34", "C35", "C36", "D31", "D32", "D33"
    ],
    "4th Floor": [
      "AVR", "CSS LAB", "CISCO LAB", "Computer Lab 1", "Internet Lab", "Computer Lab 2",
      "B41", "B42", "B43", "B44", "C41", "D41", "D42", "D43", "HRM Laboratory"
    ],
    "5th Floor": [
      "A51", "A52", "A53", "A54", "A55", "A56", "B51", "B52", "B53", "B54",
      "C51", "C52", "C53", "C54", "C55", "C56", "D52", "D53"
    ],
    "6th Floor": [
      "PE Room", "B61", "B62", "B63", "B64", "Digital Lab", "Energy Conversion Lab",
      "Physics Lab", "Drawing Room 1", "Drawing Room 2", "Stock Room", "Criminology Lab",
      "D61", "D62", "D63"
    ],
    "7th Floor": [
      "B71", "B72", "B73", "B74", "Anatomy Lab", "Microbiology Lab",
      "Chem Lab", "Biochem Lab", "D71", "D72", "D73"
    ]
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewItemsModal, setShowViewItemsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomItems, setRoomItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    r_name: '',
    r_description: ''
  });
  const { alert, showSuccess, showError, hideAlert } = useAlert();

  useEffect(() => {
    fetchRooms();
  }, [pagination.page, search]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/rooms?page=${pagination.page}&limit=${pagination.limit}&search=${search}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRooms();
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          r_name: '',
          r_description: ''
        });
        fetchRooms(); // Refresh the list
        showSuccess('Room added successfully!');
      } else {
        showError('Error adding room: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding room:', error);
      showError('Error adding room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setEditFormData({
      r_name: room.r_name,
      r_description: room.r_description || ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/rooms/${selectedRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedRoom(null);
        setEditFormData({
          r_name: '',
          r_description: ''
        });
        fetchRooms(); // Refresh the list
        showSuccess('Room updated successfully!');
      } else {
        showError('Error updating room: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      showError('Error updating room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewItems = async (room: Room) => {
    setSelectedRoom(room);
    setShowViewItemsModal(true);
    setItemsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/rooms/${room.id}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRoomItems(data.data || []);
      } else {
        showError('Error fetching room items: ' + data.error);
        setRoomItems([]);
      }
    } catch (error) {
      console.error('Error fetching room items:', error);
      showError('Error fetching room items');
      setRoomItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={hideAlert}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Rooms</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage school rooms and facilities for property allocation.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Room
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
                    placeholder="Search rooms by name, type, or description..."
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

        {/* Rooms Table */}
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
                        Room Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {room.r_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {room.r_description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${room.r_status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {room.r_status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditRoom(room)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <PencilIcon className="h-3 w-3 mr-1" />
                              Edit Room
                            </button>
                            <button
                              onClick={() => handleViewItems(room)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <EyeIcon className="h-3 w-3 mr-1" />
                              View Items
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {rooms.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">No rooms found.</p>
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

        {/* Add Room Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Room</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Room</label>
                    <select
                      name="r_name"
                      value={formData.r_name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a room...</option>
                      {Object.entries(floorRoomOptions).map(([floor, rooms]) => (
                        <optgroup key={floor} label={floor}>
                          {rooms.map((room) => (
                            <option key={`${floor}-${room}`} value={room}>
                              {room}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="r_description"
                      value={formData.r_description}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter room description (optional)"
                    />
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
                      {submitting ? 'Adding...' : 'Add Room'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Room Modal */}
        {showEditModal && selectedRoom && (
          <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Room</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRoom(null);
                      setEditFormData({ r_name: '', r_description: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room Name</label>
                    <input
                      type="text"
                      name="r_name"
                      value={editFormData.r_name}
                      onChange={handleEditInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter room name (e.g., Room 101, Computer Lab)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="r_description"
                      value={editFormData.r_description}
                      onChange={handleEditInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter room description (optional)"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedRoom(null);
                        setEditFormData({ r_name: '', r_description: '' });
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
                      {submitting ? 'Updating...' : 'Update Room'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Items Modal */}
        {showViewItemsModal && selectedRoom && (
          <div className="fixed inset-0 bg-gray-600/25 bg-opacity-20 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Items Currently Borrowed to {selectedRoom.r_name}</h3>
                    <p className="text-sm text-gray-500">View all items currently borrowed and assigned to this room</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowViewItemsModal(false);
                      setSelectedRoom(null);
                      setRoomItems([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {itemsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {roomItems.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item Details
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Borrower
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Borrow Details
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Purpose & Notes
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {roomItems.map((item) => (
                            <tr key={`${item.borrow_id}-${item.id}`} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="flex items-center space-x-4">
                                  <div className="h-16 w-16 flex-shrink-0">
                                    <img
                                      className="h-16 w-16 rounded-md object-cover border border-gray-300"
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
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {item.i_deviceID}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                      {item.i_model}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {item.i_category} • {item.i_brand}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">
                                    {item.borrower ? `${item.borrower.m_fname} ${item.borrower.m_lname}` : 'Unknown'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {item.borrower?.m_school_id || 'N/A'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.borrower?.m_department}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.borrower?.m_year_section}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.borrower?.m_contact}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Quantity:</span>
                                    <span className="font-medium">{item.borrow_quantity || 1}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Borrowed:</span>
                                    <span className="text-gray-900">
                                      {item.date_borrowed ? new Date(item.date_borrowed).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Due:</span>
                                    <span className={item.due_date && new Date(item.due_date) < new Date() ? 'text-red-600 font-medium' : 'text-gray-900'}>
                                      {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                  {item.due_date && new Date(item.due_date) < new Date() && (
                                    <div className="text-xs text-red-600 font-medium">
                                      Overdue by {Math.floor((new Date().getTime() - new Date(item.due_date).getTime()) / (1000 * 60 * 60 * 24))} day(s)
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm space-y-2 max-w-xs">
                                  {item.borrow_purpose && (
                                    <div>
                                      <div className="text-xs text-gray-500 font-medium">Purpose:</div>
                                      <div className="text-gray-900 text-xs leading-relaxed break-words">
                                        {item.borrow_purpose}
                                      </div>
                                    </div>
                                  )}
                                  {item.borrow_notes && (
                                    <div>
                                      <div className="text-xs text-gray-500 font-medium">Notes:</div>
                                      <div className="text-gray-700 text-xs leading-relaxed break-words">
                                        {item.borrow_notes}
                                      </div>
                                    </div>
                                  )}
                                  {!item.borrow_purpose && !item.borrow_notes && (
                                    <div className="text-xs text-gray-400 italic">No purpose or notes specified</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col space-y-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.borrow_status === 1
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.borrow_status === 1 ? 'Borrowed' : 'Unknown Status'}
                                  </span>
                                  {item.due_date && new Date(item.due_date) < new Date() && (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                      Overdue
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12">
                        <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No borrowed items found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          This room doesn't have any items currently borrowed to it.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowViewItemsModal(false);
                      setSelectedRoom(null);
                      setRoomItems([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
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
