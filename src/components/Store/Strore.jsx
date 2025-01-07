import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ChevronDown, ChevronRight, MinusIcon } from 'lucide-react';
import axios from 'axios';
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
    if (!isAuthenticated) {
      navigate('/user/login');
      return;
    }
  
    try {
      // Find default variant with lowest price
      const defaultVariant = product.variants.reduce((lowest, current) => {
        const currentFinalPrice = current.finalPrice || current.price * (1 - (current.discount || 0) / 100);
        const lowestFinalPrice = lowest.finalPrice || lowest.price * (1 - (lowest.discount || 0) / 100);
        return currentFinalPrice < lowestFinalPrice ? current : lowest;
      }, product.variants[0]);
  
      if (!defaultVariant) {
        alert('No variant available for this product');
        return;
      }
  
      if (!userId) {
        alert('User ID not found');
        return;
      }
  
      // Log the request data for debugging
      console.log('Sending cart request with data:', {
        userId,
        productId: product._id,
        variantId: defaultVariant._id,
        quantity: 1
      });
  
      const response = await axios.post('http://localhost:3000/user/cart/add', {
        userId,
        productId: product._id,
        variantId: defaultVariant._id,
        quantity: 1
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 200) {
        dispatch(addToCart({
          product,
          quantity: 1,
          variant: defaultVariant
        }));
  
        // Check if item already exists in cart
        const existingCartItem = cartItems.find(
          item => item.productId === product._id && item.variantId === defaultVariant._id
        );
  
        const message = existingCartItem 
          ? 'Product quantity updated in cart'
          : 'Product added to cart successfully';
        alert(message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        alert(`Failed to add product to cart: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Failed to add product to cart: No response from server');
      } else {
        console.error('Error setting up request:', error.message);
        alert('Failed to add product to cart: Request setup error');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Discover Top-Quality Riding Gear for Every Adventure
      </h1>
      
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">Filters</h3>
            
            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category._id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleToggleCategoryFilter(category._id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{category.categoryName}</span>
                      </label>
                      {category.subcategories?.length > 0 && (
                        <button
                          onClick={() => handleToggleCategory(category._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedCategories[category._id] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {expandedCategories[category._id] && category.subcategories?.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {category.subcategories.map(sub => (
                          <label key={sub._id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(sub._id)}
                              onChange={() => handleToggleCategoryFilter(sub._id)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{sub.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
            <h4 className="font-medium mb-4">Price Range</h4>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceRange[0] === 0 ? '' : priceRange[0]}
            onChange={(e) => handlePriceRangeChange(0, e.target.value)}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="Min"
            min="0"
          />
          <MinusIcon className="w-4 h-4 text-gray-400" />
          <input
            type="number"
            value={priceRange[1] === 0 ? '' : priceRange[1]}
            onChange={(e) => handlePriceRangeChange(1, e.target.value)}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="Max"
            min="0"
          />
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => dispatch(setPriceRange([0, 10000]))}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset Price
          </button>
        </div>
      </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
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
            {currentProducts.map((product) => (
              <div key={product._id} className="group relative bg-white p-2 rounded-lg shadow">
                <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-1">
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
                <div className="relative aspect-square mb-3">
                  <img
                    src={product.images[0]}
                    alt={product.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-2 line-clamp-2 h-10">
                    {product.productName}
                  </h3>
                  <div className="mb-2 flex flex-col items-center">
                    {(() => {
                      const { originalPrice, finalPrice, discount } = getPriceDetails(product.variants);
                      return (
                        <>
                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{finalPrice.toFixed(2)}
                            </span>
                            {discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {discount > 0 && (
                            <span className="text-sm text-green-600">
                              {discount}% off
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => handleAddToCart(product)} 
                  className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-4 text-sm rounded"
                >
                  Add to Cart
                </button>
                    <button  onClick={() => navigate(`/user/product/${product._id}`)} className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-4 text-sm rounded">
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
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