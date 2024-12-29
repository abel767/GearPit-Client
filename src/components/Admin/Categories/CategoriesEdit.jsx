import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    categoryName: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryData();
  }, [id]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      // Using the correct endpoint that matches your backend route
      const response = await axios.get(`http://localhost:3000/admin/categorydata/${id}`);
      const category = response.data;
      setFormData({
        categoryName: category.categoryName || '',
        description: category.description || ''
      });
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Using the correct endpoint that matches your backend route
      await axios.put(`http://localhost:3000/admin/editcategory/${id}`, formData);
      navigate('/admin/categorydata');
    } catch (err) {
      console.error('Error updating category:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update category');
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/categorydata');
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500 mb-4">{error}</div>
        <div className="text-center">
          <button
            onClick={() => navigate('/admin/categorydata')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Edit Category</h2>
          <div className="flex items-center space-x-2 text-sm mt-1">
            <span className="text-blue-500">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-blue-500">Categories</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">Edit Category</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md flex items-center gap-2 hover:bg-black/90"
          >
            <Check className="w-4 h-4" />
            Save Category
          </button>
        </div>
      </div>

      <div className="flex gap-6">

        {/* Right Column - General Information */}
        <div className="flex-1 bg-gray-50 rounded-lg p-6">
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
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Description
              </label>
              <textarea
                rows={6}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}