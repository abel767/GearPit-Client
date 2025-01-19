import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/categorydata');
      console.log('API Response:', response.data); // Log the response to debug
      setCategories(Array.isArray(response.data) ? response.data : []); // Normalize data
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      await axiosInstance.put(`/admin/categorystatus/${id}`, {
        isActive: !currentStatus
      });
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error updating category status:', err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/editcategory/${id}`);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(categories.map(cat => cat._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!Array.isArray(categories)) {
    return <div className="p-6 text-center text-red-500">Invalid categories data.</div>;
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/admin/addcategorydata')}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Category
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
            Export
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center py-2 px-4 bg-gray-50 rounded-t-lg">
          <div className="w-8">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              onChange={handleSelectAll}
              checked={selectedItems.length === categories.length}
            />
          </div>
          <div className="flex-1 font-medium text-sm text-gray-500">Category Name</div>
          <div className="w-32 font-medium text-sm text-gray-500">Status</div>
          <div className="w-48 font-medium text-sm text-gray-500">Description</div>
          <div className="w-32 font-medium text-sm text-gray-500">Action</div>
        </div>

        {categories.map((category) => (
          <div
            key={category._id}
            className="flex items-center py-4 px-4 border-b border-gray-100 hover:bg-gray-50"
          >
            <div className="w-8">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={selectedItems.includes(category._id)}
                onChange={() => handleSelectItem(category._id)}
              />
            </div>
            <div className="flex-1 flex items-center gap-3">
              <span className="text-sm">{category.categoryName}</span>
            </div>
            <div className="w-32 text-sm text-gray-600">
              <button
                onClick={() => handleStatusChange(category._id, category.isActive)}
                className={`px-2 py-1 rounded ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
            <div className="w-48 text-sm text-gray-600 truncate">
              {category.description || 'No description'}
            </div>
            <div className="w-32 flex gap-2">
              <button
                onClick={() => handleEdit(category._id)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Edit"
              >
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded"
                title="View"
              >
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
