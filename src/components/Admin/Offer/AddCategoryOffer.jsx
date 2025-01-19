import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
const AddCategoryOffer = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [percentage, setPercentage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const categoriesPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/categorydata?page=${currentPage}&limit=${categoriesPerPage}`);
      const categoryData = response.data?.categories || response.data || [];
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      
      if (response.data?.totalCategories) {
        setTotalPages(Math.ceil(response.data.totalCategories / categoriesPerPage));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    if (!percentage || percentage < 0 || percentage > 100) {
      setError('Please enter a valid percentage between 0 and 100');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      const response = await axiosInstance.post('/admin/category-offer', {
        categoryId: selectedCategory._id,
        percentage: Number(percentage),
        startDate,
        endDate
      });

      if (response.status === 200) {
        navigate('/admin/offermanagement');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding offer');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate("/admin/offermanagement")} 
        className="flex items-center text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Offer Management
      </button>
      
      <h1 className="text-2xl font-semibold mb-6">Add Category Offer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Select Category</h2>
        {loading ? (
          <div className="text-center py-4">Loading categories...</div>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCategory?._id === category._id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{category.categoryName}</h3>
                    <p className="text-sm text-gray-600">
                      Status: {category.status ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {category.offer?.isActive && (
                    <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                      Active Offer: {category.offer.percentage}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center space-x-2 mt-4">
          <button
            className="px-4 py-2 rounded border disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 rounded border disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {selectedCategory && (
        <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6">
          <div>
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage
            </label>
            <input
              type="number"
              id="percentage"
              min="0"
              max="100"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter percentage (0-100)"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full px-4 py-2 border rounded-lg"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full px-4 py-2 border rounded-lg"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Add Category Offer
          </button>
        </form>
      )}
    </div>
  );
};

export default AddCategoryOffer;