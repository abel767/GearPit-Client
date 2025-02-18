import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Eye, Edit, Ban, Play,ChevronLeft,ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Products");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

   // Calculate pagination values
   const totalPages = Math.ceil(products.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const currentProducts = products.slice(startIndex, endIndex);
 
   const handlePageChange = (page) => {
     setCurrentPage(page);
     window.scrollTo({ top: 0, behavior: 'smooth' });
   };
 
   const handleItemsPerPageChange = (e) => {
     setItemsPerPage(Number(e.target.value));
     setCurrentPage(1);
   };

  const handleEdit = (id) => {
    navigate(`/admin/editproduct/${id}`);
  };
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/productdata`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log("Products data received:", data);
        // Ensure data is always an array
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
        setAllProducts([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [allProducts, activeFilter, selectedDate]);

  const filterProducts = () => {
    // Guard against non-array allProducts
    if (!Array.isArray(allProducts)) {
      setProducts([]);
      return;
    }

    let filtered = [...allProducts];

    if (activeFilter === "Low Stock") {
      filtered = filtered.filter((product) =>
        product.variants?.some((variant) => variant.stock <= 5 && variant.stock > 0)
      );
    } else if (activeFilter === "Out of Stock") {
      filtered = filtered.filter((product) =>
        product.variants?.every((variant) => variant.stock === 0)
      );
    } else if (activeFilter === "Published") {
      filtered = filtered.filter((product) => !product.isBlocked);
    } else if (activeFilter === "Blocked") {
      filtered = filtered.filter((product) => product.isBlocked);
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (product) =>
          new Date(product.createdAt).toDateString() ===
          new Date(selectedDate).toDateString()
      );
    }

    setProducts(filtered);
  };

  const handleToggleStatus = async (productId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/toggleproductstatus/${productId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const { product } = await response.json();
        setAllProducts(allProducts.map((p) => 
          p._id === productId ? { ...p, isBlocked: product.isBlocked } : p
        ));
        toast.success(`Product ${product.isBlocked ? 'blocked' : 'unblocked'} successfully`);
      } else {
        throw new Error('Failed to update product status');
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    }
  };

  // Helper functions with null checks
  const calculateStock = (variants = []) =>
    variants.reduce((total, variant) => total + (variant?.stock || 0), 0);

  const getLowestPrice = (variants = []) => {
    if (!variants.length) return 0;
    return variants.reduce((lowest, current) => 
      ((current?.price || 0) < (lowest?.price || 0)) ? current : lowest
    , variants[0])?.price || 0;
  };

  const getHighestDiscount = (variants = []) => {
    if (!variants.length) return 0;
    return variants.reduce((highest, current) => 
      (current?.discount || 0) > highest ? (current.discount || 0) : highest
    , 0);
  };
  
  const getLowestFinalPrice = (variants = []) => {
    if (!variants.length) return 0;
    return variants.reduce((lowest, current) => {
      const currentFinalPrice = current?.finalPrice || (current?.price || 0) * (1 - (current?.discount || 0) / 100);
      const lowestPrice = lowest?.finalPrice || (lowest?.price || 0) * (1 - (lowest?.discount || 0) / 100);
      return currentFinalPrice < lowestPrice ? current : lowest;
    }, variants[0])?.finalPrice || 0;
  };

  const getCategoryName = (category) => {
    if (!category) return "N/A";
    return typeof category === 'string' ? category : category.categoryName || "N/A";
  };

 
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center">
        <div className="text-lg md:text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">Products</h2>
        <button 
          onClick={() => navigate('/admin/addproduct')} 
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-black text-white border border-gray-300 rounded-lg"
        >
          + Add Product
        </button>
      </div>
  
      {/* Filters Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {["All Products", "Published", "Blocked", "Low Stock", "Out of Stock"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 md:px-4 py-2 text-sm rounded-lg whitespace-nowrap ${
                activeFilter === filter
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300"
          />
        </div>
      </div>
  
      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 text-center">
          <p className="text-gray-500">No products found. Click the Add Product button to add your first product.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 mb-4">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Base Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Discount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Final Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Added</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product) => (
                    <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.productName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <span className="font-medium text-gray-900">{product.productName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getCategoryName(product.category)}</td>
                      <td className="px-4 py-3">{calculateStock(product.variants)}</td>
                      <td className="px-4 py-3">₹{getLowestPrice(product.variants)}</td>
                      <td className="px-4 py-3">{getHighestDiscount(product.variants)}%</td>
                      <td className="px-4 py-3">₹{getLowestFinalPrice(product.variants)}</td>
                      <td className="px-4 py-3">
                        {product.createdAt ? format(new Date(product.createdAt), "dd MMM yyyy") : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isBlocked 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {product.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-gray-100 rounded-lg">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEdit(product._id)} className="p-2 bg-gray-100 rounded-lg">
                            <Edit size={16} />
                          </button>
                          <button
                            className={`p-2 bg-gray-100 rounded-lg ${
                              product.isBlocked ? 'text-green-600' : 'text-red-600'
                            }`}
                            onClick={() => handleToggleStatus(product._id)}
                            title={product.isBlocked ? 'Unblock Product' : 'Block Product'}
                          >
                            {product.isBlocked ? <Play size={16} /> : <Ban size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            {/* Mobile/Tablet Card View */}
            <div className="md:hidden">
              {currentProducts.map((product) => (
                <div key={product._id} className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.productName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{product.productName}</h3>
                        <p className="text-sm text-gray-600">{getCategoryName(product.category)}</p>
                      </div>
                    </div>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isBlocked 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {product.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Stock</p>
                      <p className="font-medium">{calculateStock(product.variants)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Base Price</p>
                      <p className="font-medium">₹{getLowestPrice(product.variants)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Discount</p>
                      <p className="font-medium">{getHighestDiscount(product.variants)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Final Price</p>
                      <p className="font-medium">₹{getLowestFinalPrice(product.variants)}</p>
                    </div>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Added: {product.createdAt ? format(new Date(product.createdAt), "dd MMM yyyy") : "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-gray-100 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(product._id)} className="p-2 bg-gray-100 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button
                        className={`p-2 bg-gray-100 rounded-lg ${
                          product.isBlocked ? 'text-green-600' : 'text-red-600'
                        }`}
                        onClick={() => handleToggleStatus(product._id)}
                        title={product.isBlocked ? 'Unblock Product' : 'Block Product'}
                      >
                        {product.isBlocked ? <Play size={16} /> : <Ban size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
  
            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          currentPage === pageNumber
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber}>...</span>;
                  }
                  return null;
                })}
              </div>
  
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
  
            {/* Page info */}
            <div className="text-sm text-gray-600 whitespace-nowrap">
              Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} items
            </div>
          </div>
        </>
      )}
    </div>
  );

  
};

export default Products;