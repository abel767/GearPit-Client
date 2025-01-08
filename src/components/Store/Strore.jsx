import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ChevronDown, ChevronRight, MinusIcon } from 'lucide-react';
import axios from 'axios';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AnimatedSearch from '../SerachBarForStore/AnimatedSearch';
import {
  setProducts,
  setCategories,
  toggleCategory,
  toggleCategoryFilter,
  setPriceRange,
  setSortBy,
  setCurrentPage,
  setFilterOpen,
  filterProducts,
  setLoading,
  setError
} from '../../redux/Slices/productSlice';
import { addToCart } from '../../redux/Slices/CartSlice';
import { useNavigate } from 'react-router-dom';




const sortOptions = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'Price: Low to High', value: 'price-low-to-high' },
  { label: 'Price: High to Low', value: 'price-high-to-high' },
  { label: 'Average Ratings', value: 'average-ratings' },
  { label: 'Featured', value: 'featured' },
  { label: 'New Arrivals', value: 'new-arrivals' },
  { label: 'A - Z', value: 'a-to-z' },
  { label: 'Z - A', value: 'z-to-a' },
];

const getPriceDetails = (variants) => {
  if (!variants || variants.length === 0) return { originalPrice: 0, finalPrice: 0, discount: 0 };
  
  const lowestPriceVariant = variants.reduce((lowest, current) => {
    const currentFinalPrice = current.finalPrice || current.price * (1 - (current.discount || 0) / 100);
    const lowestFinalPrice = lowest.finalPrice || lowest.price * (1 - (lowest.discount || 0) / 100);
    return currentFinalPrice < lowestFinalPrice ? current : lowest;
  }, variants[0]);

  return {
    originalPrice: lowestPriceVariant.price,
    finalPrice: lowestPriceVariant.finalPrice || lowestPriceVariant.price * (1 - (lowestPriceVariant.discount || 0) / 100),
    discount: lowestPriceVariant.discount
  };
};

const isProductOutOfStock = (variants) => {
  // Return true if variants array is empty or undefined
  if (!variants || variants.length === 0) {
    return true;
  }

  // Check if ALL variants have 0 or undefined quantity
  const allOutOfStock = variants.every(variant => {
    const quantity = Number(variant.stock); // Convert to number to handle string values
    return quantity <= 0 || isNaN(quantity);
  });

  return allOutOfStock;
};

// Rest of the code remains the same...
export default function Store() {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  
  const {
    products,
    filteredProducts,
    categories,
    selectedCategories,
    expandedCategories,
    priceRange,
    sortBy,
    currentPage,
    isFilterOpen,
    loading,
  } = useSelector(state => state.product);
  
  const userId = useSelector(state => state.user.user?._id);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const cartItems = useSelector(state => state.cart.items);

  const productsPerPage = 8;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:3000/admin/productdata'),
          axios.get('http://localhost:3000/admin/categorydata-addproduct')
        ]);
        
        const activeProducts = productsRes.data.filter(product => !product.isDeleted);
        dispatch(setProducts(activeProducts));
        dispatch(setCategories(categoriesRes.data.activeCategories));
      } catch (error) {
        console.error('Error fetching data:', error);
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    dispatch(filterProducts());
  }, [selectedCategories, priceRange, sortBy, products, dispatch]);

  const handleToggleCategory = (categoryId) => {
    dispatch(toggleCategory(categoryId));
  };

  const handleToggleCategoryFilter = (categoryId) => {
    dispatch(toggleCategoryFilter(categoryId));
  };

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = value === '' ? 0 : Number(value);
    dispatch(setPriceRange(newRange));
  };

  const handleAddToCart = async (product) => {
    const outOfStock = isProductOutOfStock(product.variants);
    
    if (outOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }
  
    if (!isAuthenticated) {
      navigate('/user/login');
      return;
    }
  
    try {
      const availableVariant = product.variants.find(variant => {
        const stock = Number(variant.stock);
        return !isNaN(stock) && stock > 0;
      });
      
      if (!availableVariant) {
        toast.error('No available variants for this product');
        return;
      }
  
      if (!userId) {
        toast.error('Please log in to add items to cart');
        return;
      }
  
      const response = await axios.post('http://localhost:3000/user/cart/add', {
        userId,
        productId: product._id,
        variantId: availableVariant._id,
        quantity: 1
      });
  
      if (response.status === 200) {
        dispatch(addToCart({
          product,
          quantity: 1,
          variant: availableVariant
        }));
  
        const existingCartItem = cartItems.find(
          item => item.productId === product._id && item.variantId === availableVariant._id
        );
  
        toast.success(existingCartItem 
          ? `${product.productName} quantity updated in cart!` 
          : `${product.productName} added to cart!`, 
          {
            duration: 3000,
            position: 'top-center',
            style: {
              backgroundColor: '#4CAF50',
              color: 'white',
            }
          }
        );
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add product to cart';
      toast.error(errorMessage);
    }
  };



  

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
    {/* <h1 className="text-2xl font-bold text-center mb-8">
      Discover Top-Quality Riding Gear for Every Adventure
    </h1> */}
    
    <div className="flex gap-6">
      {/* Filters Sidebar - now with full height and black background */}
           {/* Filters Sidebar - now with white background */}
           <div className="w-64 flex-shrink-0">
        <div className="bg-white text-black rounded-lg shadow p-4 h-screen overflow-y-auto sticky top-0">
          <h3 className="font-semibold mb-4 text-xl">Filters</h3>
          
          {/* Categories Section */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Categories</h4>
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category._id} className="space-y-2">
                  <div className="flex items-center justify-between group">
                    <label className="flex items-center space-x-3 cursor-pointer w-full">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleToggleCategoryFilter(category._id)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                          <svg
                            className={`w-4 h-4 text-white absolute top-0.5 left-0.5 ${
                              selectedCategories.includes(category._id) ? 'opacity-100' : 'opacity-0'
                            }`}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-gray-700 hover:text-gray-900 transition-colors">
                        {category.categoryName}
                      </span>
                    </label>
                    {category.subcategories?.length > 0 && (
                      <button
                        onClick={() => handleToggleCategory(category._id)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        {expandedCategories[category._id] ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Subcategories */}
                  {expandedCategories[category._id] && category.subcategories?.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {category.subcategories.map(sub => (
                        <label key={sub._id} className="flex items-center space-x-3 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(sub._id)}
                              onChange={() => handleToggleCategoryFilter(sub._id)}
                              className="peer sr-only"
                            />
                            <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                              <svg
                                className={`w-3 h-3 text-white absolute top-0.5 left-0.5 ${
                                  selectedCategories.includes(sub._id) ? 'opacity-100' : 'opacity-0'
                                }`}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <span className="text-gray-600 hover:text-gray-800 text-sm transition-colors">
                            {sub.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Price Range Section */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Price Range</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={priceRange[0] === 0 ? '' : priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Min"
                    min="0"
                  />
                </div>
                <MinusIcon className="w-5 h-5 text-gray-600" />
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={priceRange[1] === 0 ? '' : priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
              <button
                onClick={() => dispatch(setPriceRange([0, 10000]))}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg transition-colors text-sm font-medium"
              >
                Reset Price
              </button>
            </div>
          </div>
        </div>
      </div>


        {/* Main Content */}
        <div className="flex-1">
        <AnimatedSearch/>

          {/* Sort Dropdown */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <button
                className="flex items-center justify-between w-64 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={() => dispatch(setFilterOpen(!isFilterOpen))}
              >
                Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label}
                <ChevronDown className="w-5 h-5 ml-2" />
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          dispatch(setSortBy(option.value));
                          dispatch(setFilterOpen(false));
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentProducts.map((product) => {
              const outOfStock = isProductOutOfStock(product.variants);
              const { originalPrice, finalPrice, discount } = getPriceDetails(product.variants);
              
              return (
                <div 
                  key={product._id} 
                  className={`group relative bg-white p-2 rounded-lg shadow ${
                    outOfStock ? 'opacity-90' : ''
                  }`}
                >
                  {/* Wishlist Heart Button */}
                  <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-sm">
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                  </button>
                  
                  {/* Product Image Container */}
                  <div className="relative aspect-square mb-3">
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className={`w-full h-full object-contain ${
                        outOfStock ? 'opacity-60' : ''
                      }`}
                    />
                    {/* Out of Stock Badge */}
                    {outOfStock && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="text-center">
                    <h3 className="text-sm font-medium mb-2 line-clamp-2 h-10">
                      {product.productName}
                    </h3>
                    
                    {/* Price Section */}
                    <div className="mb-2 flex flex-col items-center">
                      <div className="flex items-center gap-2 justify-center">
                        <span className={`text-lg font-bold ${outOfStock ? 'text-gray-500' : 'text-gray-900'}`}>
                          ₹{finalPrice.toFixed(2)}
                        </span>
                        {discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {discount > 0 && !outOfStock && (
                        <span className="text-sm text-green-600">
                          {discount}% off
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => !outOfStock && handleAddToCart(product)}
                        disabled={outOfStock}
                        className={`
                          flex-1 py-2 px-4 text-sm rounded transition-all duration-200
                          ${outOfStock 
                            ? 'bg-red-50 text-red-500 border border-red-300 cursor-not-allowed hover:bg-red-100'
                            : 'bg-black hover:bg-gray-800 text-white'
                          }
                        `}
                      >
                        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <button 
                        onClick={() => navigate(`/user/product/${product._id}`)} 
                        className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-4 text-sm rounded transition-colors duration-200"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-1 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => dispatch(setCurrentPage(page))}
                className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${
                  page === currentPage
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                } border border-gray-300 rounded`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}