import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProductOffer = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [percentage, setPercentage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/admin/productdata?page=${currentPage}&limit=${productsPerPage}`);
      const productData = response.data?.products || response.data || [];
      setProducts(Array.isArray(productData) ? productData : []);
      
      // Set total pages if provided in response
      if (response.data?.totalProducts) {
        setTotalPages(Math.ceil(response.data.totalProducts / productsPerPage));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError('Please select a product');
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
      const response = await axios.post('http://localhost:3000/admin/product-offer', {
        productId: selectedProduct._id,
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

  const getLowestPrice = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map(v => v.finalPrice || v.price));
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
      
      <h1 className="text-2xl font-semibold mb-6">Add Product Offer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Select Product</h2>
        {loading ? (
          <div className="text-center py-4">Loading products...</div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProduct?._id === product._id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{product.productName}</h3>
                    <p className="text-sm text-gray-600">Brand: {product.brand || 'N/A'}</p>
                    <p className="text-sm text-gray-600">
                      Price: ₹{getLowestPrice(product.variants)}
                    </p>
                  </div>
                  {product.offer?.isActive && (
                    <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                      Active Offer: {product.offer.percentage}%
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

      {selectedProduct && (
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
            Add Product Offer
          </button>
        </form>
      )}
    </div>
  );
};

export default AddProductOffer;