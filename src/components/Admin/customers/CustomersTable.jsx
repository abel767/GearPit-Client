import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { format } from 'date-fns';

// Card component for mobile view
const CustomerCard = ({ user, onBlockUnblock }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600">
        {user.userName ? user.userName.charAt(0).toUpperCase() : 'N/A'}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{user.userName || 'Unknown User'}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Phone:</span>
        <span className="text-gray-900">{user.phone || 'Not Given'}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Status:</span>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Added:</span>
        <span className="text-gray-900">{format(new Date(user.createdAt), 'dd MMM yyyy')}</span>
      </div>
      
      <button
        onClick={() => onBlockUnblock(user._id, user.isBlocked)}
        className={`w-full mt-2 px-4 py-2 rounded text-white ${
          user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {user.isBlocked ? 'Unblock' : 'Block'}
      </button>
    </div>
  </div>
);

export default function CustomersTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/data', { withCredentials: true });
      const usersWithDefaults = response.data.map(user => ({
        ...user,
        userName: user.userName || 'Unknown User',
      }));
      setAllUsers(usersWithDefaults);
      setFilteredUsers(usersWithDefaults);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchQuery, activeFilter, allUsers]);

  const handleSearchAndFilter = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = allUsers.filter(user => {
      const matchesSearch =
        user.userName.toLowerCase().includes(lowercasedQuery) ||
        user.email.toLowerCase().includes(lowercasedQuery) ||
        (user.phone && user.phone.toLowerCase().includes(lowercasedQuery));

      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Active' && !user.isBlocked) ||
        (activeFilter === 'Blocked' && user.isBlocked);

      return matchesSearch && matchesFilter;
    });
    setFilteredUsers(filtered);
  };

  const handleBlockUnblock = async (userId, isBlocked) => {
    try {
      await axiosInstance.put(
        `/admin/block/${userId}`,
        { isBlocked: !isBlocked },
        { withCredentials: true }
      );
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };
  
  return (
    <div className="p-4 sm:p-6 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Customers</h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-blue-600">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Customers List</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between overflow-x-auto">
          <div className="flex gap-2">
            {['All', 'Active', 'Blocked'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                } rounded-md`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Added</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600">
                        {user.userName ? user.userName.charAt(0).toUpperCase() : 'N/A'}
                      </div>
                      <span className="text-gray-900 font-medium">{user.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.phone || 'Not Given'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{format(new Date(user.createdAt), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                      className={`px-4 py-2 rounded text-white ${
                        user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <CustomerCard
            key={user._id}
            user={user}
            onBlockUnblock={handleBlockUnblock}
          />
        ))}
      </div>
    </div>
  );
}