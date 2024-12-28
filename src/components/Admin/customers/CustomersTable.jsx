import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function CustomersTable() {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get('http://localhost:3000/admin/data', { withCredentials: true });
        const usersWithDefaults = response.data.map(user => ({
          ...user,
          userName: user.userName || 'Unknown User', // Retaining userName
        }));
        setAllUsers(usersWithDefaults);
        setFilteredUsers(usersWithDefaults);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchQuery, activeFilter, allUsers]);

  const handleSearchAndFilter = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = allUsers.filter(user => {
      const matchesSearch =
        user.userName.toLowerCase().includes(lowercasedQuery) || // Retained userName
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
      // Send the PATCH request to toggle the isBlocked status
      const response = await axios.put(
        `http://localhost:3000/admin/block/${userId}`,  // Use `userId` instead of `id`
        { isBlocked: !isBlocked }, // Toggle the block status
        { withCredentials: true }
      );
  
      const updatedUser = response.data; // Get the updated user from the response
  
      // Update the user status locally after the patch request
      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isBlocked: updatedUser.isBlocked } : user
        )
      );
      setFilteredUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isBlocked: updatedUser.isBlocked } : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };
  
  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-gray-900">Customers</h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-blue-600">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Customers List</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
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
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['All', 'Active', 'Blocked'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 ${
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
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
                      {user.userName ? user.userName.charAt(0).toUpperCase() : 'N/A'} {/* Retained userName */}
                    </div>
                    <span className="text-gray-900 font-medium">{user.userName || 'Unknown User'}</span>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                      className={`px-4 py-2 rounded text-white ${
                        user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
