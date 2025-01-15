import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ChevronDown, Tag  } from 'lucide-react';
import axios from 'axios';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AnimatedSearch from '../SerachBarForStore/AnimatedSearch';
import {
  setProducts,
  setCategories,
  toggleCategoryFilter,
  setPriceRange,
  setSortBy,
  setCurrentPage,
  setFilterOpen,
  filterProducts,
  setLoading,
  setError,
  setSizeFilter
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

const predefinedPriceRanges = [
  { label: '₹0 - ₹1000', min: 0, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000 - ₹3000', min: 2000, max: 3000 },
  { label: '₹3000 - ₹4000', min: 3000, max: 4000 },
  { label: '₹4000+', min: 4000, max: 100000 },
];

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];


const getPriceDetails = (variants, offer) => {
  if (!variants || variants.length === 0) return { originalPrice: 0, finalPrice: 0, discount: 0 };
  
  const lowestPriceVariant = variants.reduce((lowest, current) => {
    const currentFinalPrice = current.finalPrice || current.price * (1 - (current.discount || 0) / 100);
    const lowestFinalPrice = lowest.finalPrice || lowest.price * (1 - (lowest.discount || 0) / 100);
    return currentFinalPrice < lowestFinalPrice ? current : lowest;
  }, variants[0]);

  let finalPrice = lowestPriceVariant.price;
  let totalDiscount = 0;

  // Apply variant discount
  if (lowestPriceVariant.discount > 0) {
    totalDiscount = lowestPriceVariant.discount;
    finalPrice *= (1 - lowestPriceVariant.discount / 100);
  }

  // Apply offer discount if active
  if (offer?.isActive && offer?.percentage > 0) {
    totalDiscount = totalDiscount > 0 ? totalDiscount + offer.percentage : offer.percentage;
    finalPrice *= (1 - offer.percentage / 100);
  }

  return {
    originalPrice: lowestPriceVariant.price,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discount: totalDiscount
  };
};


const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    size: true,
    priceRange: true
  });

  
  const {
    products,
    filteredProducts,
    categories,
    selectedCategories,
    priceRange,
    sortBy,
    currentPage,
    isFilterOpen,
    loading,
    selectedSizes
  } = useSelector(state => state.product);

  
  const handleToggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  
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
        
        // Filter out both deleted AND blocked products
        const activeProducts = productsRes.data.filter(product => 
          !product.isDeleted && !product.isBlocked
        );
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

  // const handleToggleCategory = (categoryId) => {
  //   dispatch(toggleCategory(categoryId));
  // };

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

  const handleSizeToggle = (size) => {
    dispatch(setSizeFilter(size));
  };

  const handlePriceRangeSelect = (min, max) => {
    dispatch(setPriceRange([min, max]));
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
      {/* Filters Sidebar */}
           <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg p-4 h-screen overflow-y-auto sticky top-0">
            <h3 className="font-semibold mb-4 text-xl">Filters</h3>
          
            <div className="border-b pb-4 mb-4">
              <button 
                className="w-full flex items-center justify-between text-sm font-medium py-2"
                onClick={() => handleToggleSection('category')}
              >
                CATEGORY
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className={`mt-2 space-y-2 ${expandedSections.category ? '' : 'hidden'}`}>
                {categories.map(category => (
                  <label key={category._id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleToggleCategoryFilter(category._id)}
                      className="rounded border-gray-300"
                    />
                    <span>{category.categoryName}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Section */}
            <div className="border-b pb-4 mb-4">
              <button 
                className="w-full flex items-center justify-between text-sm font-medium py-2"
                onClick={() => handleToggleSection('size')}
              >
                SIZE
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className={`mt-2 space-y-2 ${expandedSections.size ? '' : 'hidden'}`}>
                {sizeOptions.map(size => (
                  <label key={size} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                      className="rounded border-gray-300"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Section */}
            <div className="pb-4">
              <button 
                className="w-full flex items-center justify-between text-sm font-medium py-2"
                onClick={() => handleToggleSection('priceRange')}
              >
                PRICE RANGE
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className={`mt-4 space-y-4 ${expandedSections.priceRange ? '' : 'hidden'}`}>
                {/* Predefined ranges */}
                <div className="space-y-2">
                  {predefinedPriceRanges.map(range => (
                    <label key={range.label} className="flex items-center space-x-2 text-sm">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={priceRange[0] === range.min && priceRange[1] === range.max}
                        onChange={() => handlePriceRangeSelect(range.min, range.max)}
                        className="rounded border-gray-300"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
                
                {/* Custom range inputs */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Custom Range</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => dispatch(setPriceRange([0, 10000]))}
                    className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
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
        <AnimatedSearch/>

          {/* Sort Dropdown */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <button
                className="flex items-center justify-between w-64 px-7 py-3 text-sm font-medium text-gray-700 bg-white border border-black  shadow-sm hover:bg-gray-50"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentProducts.map((product) => {
          const outOfStock = isProductOutOfStock(product.variants);
          const { originalPrice, finalPrice, discount } = getPriceDetails(product.variants, product.offer);
          const hasOffer = product.offer?.isActive && product.offer?.percentage > 0;
          
          return (
            <div 
              key={product._id} 
              className="group relative bg-white p-2 rounded-lg"
            >
              {/* Wishlist Heart Button */}
              <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-sm">
                <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
              </button>
              
              {/* Offer Tag */}
              {hasOffer && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-md">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      {product.offer.percentage}% OFF
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 bg-white px-2 py-1 mt-1 rounded-md shadow-sm">
                    Ends {formatDate(product.offer.endDate)}
                  </div>
                </div>
              )}
              
              {/* Product Image */}
              <div className="relative aspect-square mb-3">
                <img
                  src={product.images[0]}
                  alt={product.productName}
                  className={`w-full h-full object-contain ${outOfStock ? 'opacity-60' : ''}`}
                />
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
                    View
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