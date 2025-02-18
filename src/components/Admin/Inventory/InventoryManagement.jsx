import { useState, useEffect } from 'react';
import { BarChart3, Search, ArrowUpDown, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/admin/productdata', {
        withCredentials: true
      });
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch inventory data');
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const calculateTotalStock = (variants) => {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  };

  const getLowestStock = (variants) => {
    return Math.min(...variants.map(v => v.stock));
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortConfig.key === 'stock') {
      const aStock = calculateTotalStock(a.variants);
      const bStock = calculateTotalStock(b.variants);
      return sortConfig.direction === 'ascending' ? aStock - bStock : bStock - aStock;
    }
    if (sortConfig.key === 'productName') {
      return sortConfig.direction === 'ascending' 
        ? a.productName.localeCompare(b.productName)
        : b.productName.localeCompare(a.productName);
    }
    return 0;
  });

  const filteredProducts = sortedProducts.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const ProductCard = ({ product }) => {
    const totalStock = calculateTotalStock(product.variants);
    const lowestStock = getLowestStock(product.variants);
    
    let stockStatus = 'text-green-500 bg-green-50';
    if (lowestStock <= 5) {
      stockStatus = 'text-red-500 bg-red-50';
    } else if (lowestStock <= 10) {
      stockStatus = 'text-yellow-500 bg-yellow-50';
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
        <div className="flex items-start gap-3">
          {product.images && product.images[0] && (
            <img
              src={product.images[0]}
              alt={product.productName}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{product.productName}</h3>
            <div className="mt-1 text-sm text-gray-500">
              <p>Brand: {product.brand || 'N/A'}</p>
              <p>Category: {product.category?.categoryName || 'N/A'}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/admin/editproduct/${product._id}`)}
            className="p-2 bg-gray-100 rounded-lg"
          >
            <Edit size={16} />
          </button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">Total Stock: </span>
            <span className="font-medium">{totalStock}</span>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${stockStatus}`}>
            {lowestStock <= 5 ? 'Low Stock' : lowestStock <= 10 ? 'Medium Stock' : 'In Stock'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="text-gray-500" />
          <h1 className="text-xl sm:text-2xl font-semibold">Inventory Management</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden">
          <div className="p-4">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500">No products found</p>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('productName')}
                    className="flex items-center text-sm font-medium text-gray-500"
                  >
                    Product Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Brand</th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('stock')}
                    className="flex items-center text-sm font-medium text-gray-500"
                  >
                    Total Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const totalStock = calculateTotalStock(product.variants);
                const lowestStock = getLowestStock(product.variants);
                
                let stockStatus = 'text-green-500 bg-green-50';
                if (lowestStock <= 5) {
                  stockStatus = 'text-red-500 bg-red-50';
                } else if (lowestStock <= 10) {
                  stockStatus = 'text-yellow-500 bg-yellow-50';
                }

                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.productName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <span className="font-medium">{product.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {product.category?.categoryName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {product.brand || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {totalStock}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus}`}>
                        {lowestStock <= 5 ? 'Low Stock' : lowestStock <= 10 ? 'Medium Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => navigate(`/admin/editproduct/${product._id}`)}
                        className="p-2 bg-gray-100 rounded-lg"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InventoryManagement;