import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ChevronDown,Filter,X, Tag  } from 'lucide-react';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../api/axiosInstance';

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

const ProductCard = ({ product, onAddToCart, onWishlistToggle, isInWishlist, navigate }) => {
  const { originalPrice, finalPrice, discount } = getPriceDetails(product.variants, product.offer);
  const outOfStock = isProductOutOfStock(product.variants);

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Wishlist Button */}
      <button 
        onClick={(e) => onWishlistToggle(e, product)}
        className="absolute right-3 top-3 z-10 bg-white rounded-full p-2 shadow-sm"
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${
            isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'
          }`}
        />
      </button>

      {/* Product Image with Overlay */}
      <div 
        className="relative aspect-[3/4] cursor-pointer"
        onClick={() => navigate(`/user/product/${product._id}`)}
      >
        <img
          src={product.images[0]}
          alt={product.productName}
          className="w-full h-full object-cover"
        />
        
        {/* Hover Overlay with Add to Cart */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              !outOfStock && onAddToCart(product);
            }}
            disabled={outOfStock}
            className={`w-[90%] py-3 text-sm font-medium transition-all duration-200
              ${outOfStock 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-white hover:bg-gray-100'
              }`}
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium mb-2 line-clamp-1">
          {product.productName}
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="text-base font-bold">
            ₹{finalPrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-sm text-gray-500 line-through">
                ₹{originalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-green-600">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


import { addToWishlist, removeFromWishlist } from '../../redux/Slices/wishlistSlice';

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

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '40','41','42'];


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

export default function Store() {

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);



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
  const wishlistItems = useSelector(state => state.wishlist.items);


    // Determine offer details and source
    const determineOfferSource = (product) => {
      const lowestPriceVariant = product.variants.reduce((lowest, current) => 
        current.finalPrice < lowest.finalPrice ? current : lowest
      );
  
      const offerSources = [
        { source: 'variant', discount: lowestPriceVariant.discount || 0 },
        { source: 'product', discount: product.offer?.isActive ? product.offer.percentage : 0 },
        { source: 'category', discount: product.category?.offer?.isActive ? product.category.offer.percentage : 0 }
      ];
  
      const highestOffer = offerSources.reduce((highest, current) => 
        current.discount > highest.discount ? current : highest
      );
  
      return {
        originalPrice: lowestPriceVariant.price,
        finalPrice: lowestPriceVariant.finalPrice,
        discount: highestOffer.discount,
        offerSource: highestOffer.source
      };
    };

    

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/user/login');
      return;
    }

    if (!userId) {
      toast.error('User ID not found');
      return;
    }

    const isInWishlist = wishlistItems.some(item => item._id === product._id);
    
    try {
      if (isInWishlist) {
        const response = await axiosInstance.delete(`/user/wishlist/remove/${product._id}`, {
          data: { userId }
        });
        
        if (response.status === 200) {
          dispatch(removeFromWishlist(product._id));
          toast.success('Removed from wishlist');
        }
      } else {
        const response = await axiosInstance.post('/user/wishlist/add', {
          userId,
          productId: product._id
        });
        
        if (response.status === 200) {
          dispatch(addToWishlist(product));
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update wishlist';
      toast.error(errorMessage);
    }
  };

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
          axiosInstance.get('/admin/productdata'),
          axiosInstance.get('/admin/categorydata-addproduct')
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
  }, [selectedCategories, priceRange, sortBy, products, selectedSizes, dispatch]);

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
  
      const response = await axiosInstance.post('/user/cart/add', {
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
      {/* Mobile filter dialog */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-black text-white rounded-full p-4 shadow-lg flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
  
        {/* Mobile filter overlay */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-25" onClick={() => setIsMobileFiltersOpen(false)} />
        )}
  
        {/* Mobile filter sidebar */}
        <div
  className={`
    fixed inset-y-0 right-0 z-50 w-full bg-white px-4 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10
    transform transition-transform duration-300 overflow-y-auto  // Add this line
    ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'}
  `}
>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
  
          {/* Mobile Filters Content */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="border-b pb-6">
              <h3 className="font-medium mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map(category => (
                  <label key={category._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleToggleCategoryFilter(category._id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{category.categoryName}</span>
                  </label>
                ))}
              </div>
            </div>
  
            {/* Sizes */}
            <div className="border-b pb-6">
              <h3 className="font-medium mb-4">Sizes</h3>
              <div className="space-y-3">
                {sizeOptions.map(size => (
                  <label key={size} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{size}</span>
                  </label>
                ))}
              </div>
            </div>
  
            {/* Price Range */}
            <div>
              <h3 className="font-medium mb-4">Price Range</h3>
              <div className="space-y-3">
                {predefinedPriceRanges.map(range => (
                  <label key={range.label} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange[0] === range.min && priceRange[1] === range.max}
                      onChange={() => handlePriceRangeSelect(range.min, range.max)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg p-4 sticky top-20">
            <h3 className="font-semibold mb-4 text-xl">Filters</h3>
  
            {/* Desktop Categories */}
            <div className="border-b pb-4 mb-4">
              <button 
                className="w-full flex items-center justify-between text-sm font-medium py-2"
                onClick={() => handleToggleSection('category')}
              >
                CATEGORY
                <ChevronDown className={`w-4 h-4 transform ${expandedSections.category ? 'rotate-180' : ''}`} />
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
  
            {/* Desktop Sizes */}
            <div className="border-b pb-4 mb-4">
              <button 
                className="w-full flex items-center justify-between text-sm font-medium py-2"
                onClick={() => handleToggleSection('size')}
              >
                SIZE
                <ChevronDown className={`w-4 h-4 transform ${expandedSections.size ? 'rotate-180' : ''}`} />
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
  
            {/* Desktop Price Range */}
            <div>
              <button 
                className="w-full flex items-center justify-between text-sm font-medium py-2"
                onClick={() => handleToggleSection('priceRange')}
              >
                PRICE RANGE
                <ChevronDown className={`w-4 h-4 transform ${expandedSections.priceRange ? 'rotate-180' : ''}`} />
              </button>
              <div className={`mt-4 space-y-4 ${expandedSections.priceRange ? '' : 'hidden'}`}>
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
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Custom Range</p>
                  <div className="flex items-center gap-2">
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
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <AnimatedSearch />
            
            {/* Sort Dropdown */}
            <div className="relative mt-4 sm:mt-0 z-30">
              <button
                className="flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={() => dispatch(setFilterOpen(!isFilterOpen))}
              >
                Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label}
                <ChevronDown className="w-5 h-5 ml-2" />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
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
  
        {/* Product Grid */}
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {currentProducts.map(product => {
    const offerDetails = determineOfferSource(product);
    const hasOffer = offerDetails.discount > 0;
    const isOutOfStock = isProductOutOfStock(product.variants);

    return (
      <div key={product._id} className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Wishlist Button */}
        <button 
          onClick={(e) => handleWishlistToggle(e, product)}
          className="absolute right-3 top-3 z-10 bg-white rounded-full p-2 shadow-sm"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              wishlistItems.some(item => item._id === product._id) 
                ? 'text-red-500 fill-current' 
                : 'text-gray-400'
            }`}
          />
        </button>

        {/* Offer Tag */}
        {hasOffer && (
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-md">
              <Tag className="w-4 h-4" />
              <span className="text-xs font-semibold">
                {offerDetails.discount}% OFF
                {offerDetails.offerSource === 'variant' && ' (Variant)'}
                {offerDetails.offerSource === 'product' && ' (Product)'}
                {offerDetails.offerSource === 'category' && ' (Category)'}
              </span>
            </div>
            {/* Show the specific offer end date */}
            {offerDetails.offerSource === 'product' && product.offer?.endDate && (
              <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded-md shadow-sm">
                Ends {formatDate(product.offer.endDate)}
              </div>
            )}
            {offerDetails.offerSource === 'category' && product.category?.offer?.endDate && (
              <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded-md shadow-sm">
                Category Offer Ends {formatDate(product.category.offer.endDate)}
              </div>
            )}
          </div>
        )}

        {/* Product Image with Overlay */}
        <div 
          className="relative aspect-[3/4] cursor-pointer"
          onClick={() => navigate(`/user/product/${product._id}`)}
        >
          <img
            src={product.images[0]}
            alt={product.productName}
            className="w-full h-full object-cover"
          />
          
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* Hover Overlay with Add to Cart */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                !isOutOfStock && handleAddToCart(product);
              }}
              disabled={isOutOfStock}
              className={`w-[90%] py-3 text-sm font-medium transition-all duration-200
                ${isOutOfStock 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100'
                }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2 line-clamp-1">
            {product.productName}
          </h3>

          <p className="text-xs text-gray-400 mb-2">
            {product.category?.categoryName || 'Uncategorized'}
          </p>
          
          <div className="flex items-center gap-2">
            {hasOffer ? (
              <>
                <span className="text-base font-bold">
                  ₹{offerDetails.finalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{offerDetails.originalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-green-600">
                  {offerDetails.discount}% off
                </span>
              </>
            ) : (
              <span className="text-base font-bold">
                ₹{offerDetails.finalPrice.toFixed(2)}
              </span>
            )}
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