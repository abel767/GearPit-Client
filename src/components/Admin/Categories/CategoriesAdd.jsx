import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function AddCategories() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        // Validate category name
        if (!formData.categoryName.trim()) {
            throw new Error('Category name is required');
        }

        // Create category data object
        const categoryData = {
            categoryName: formData.categoryName.trim(),
            description: formData.description.trim(),
            isActive: formData.isActive,
        };

        // Send category data to backend
        await axiosInstance.post('/admin/addcategorydata', categoryData);

        // Navigate to categories list page after successful submission
        navigate('/admin/categorydata');
    } catch (err) {
        setError(err.response?.data?.message || err.message); // Handle errors
    } finally {
        setLoading(false); // Stop loading spinner after submission
    }
};

return (
  <div className="p-4 md:p-6 bg-white min-h-screen">
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">Add Category</h2>
          <div className="flex flex-wrap items-center gap-x-2 text-sm mt-1">
            <span className="text-blue-500">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-blue-500">Categories</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">Add Category</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate('/admin/categorydata')}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center justify-center gap-2 border border-gray-300"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-black text-white rounded-md flex items-center justify-center gap-2 hover:bg-black/90 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Form Content */}
      <div className="w-full">
        {/* General Information */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h3 className="text-sm font-medium mb-4">General Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Category Name
              </label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleInputChange}
                placeholder="Type category name here..."
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Type category description here..."
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
);
}
