import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/Slices/CartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/Slices/wishlistSlice';

const getPriceDetails = (variants, offer) => {
  if (!variants || variants.length === 0) return { originalPrice: 0, finalPrice: 0, discount: 0 };
  
  const lowestPriceVariant = variants.reduce((lowest, current) => {
    const currentFinalPrice = current.finalPrice || current.price * (1 - (current.discount || 0) / 100);
    const lowestFinalPrice = lowest.finalPrice || lowest.price * (1 - (lowest.discount || 0) / 100);
    return currentFinalPrice < lowestFinalPrice ? current : lowest;
  }, variants[0]);

  let finalPrice = lowestPriceVariant.price;
  let totalDiscount = 0;

  if (lowestPriceVariant.discount > 0) {
    totalDiscount = lowestPriceVariant.discount;
    finalPrice *= (1 - lowestPriceVariant.discount / 100);
  }

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
  if (!variants || variants.length === 0) return true;
  return variants.every(variant => {
    const quantity = Number(variant.stock);
    return quantity <= 0 || isNaN(quantity);
  });
};

function Featured() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = useSelector(state => state.user.user?._id);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/admin/productdata');
        const activeProducts = response.data
          .filter(product => !product.isDeleted && !product.isBlocked)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);
        setProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/user/login');
      return;
    }

    const isInWishlist = wishlistItems.some(item => item._id === product._id);
    
    try {
      if (isInWishlist) {
        await axiosInstance.delete(`/user/wishlist/remove/${product._id}`, {
          data: { userId }
        });
        dispatch(removeFromWishlist(product._id));
        toast.success('Removed from wishlist');
      } else {
        await axiosInstance.post('/user/wishlist/add', {
          userId,
          productId: product._id
        });
        dispatch(addToWishlist(product));
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/user/login');
      return;
    }

    const outOfStock = isProductOutOfStock(product.variants);
    if (outOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }

    try {
      const availableVariant = product.variants.find(variant => Number(variant.stock) > 0);
      
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
        toast.success(`${product.productName} added to cart!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product to cart');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">Loading...</div>;
  }

  return (
    <section className="py-8 px-4">
      <h2 className="text-center text-2xl font-bold mb-6">New Arrivals</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => {
          const hasOffer = product.offer?.isActive && product.offer?.percentage > 0;
          const outOfStock = isProductOutOfStock(product.variants);
          const { originalPrice, finalPrice, discount } = getPriceDetails(product.variants, product.offer);
          
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
                      {product.offer.percentage}% OFF
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded-md shadow-sm">
                    Ends {formatDate(product.offer.endDate)}
                  </div>
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
                {outOfStock && (
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
                      !outOfStock && handleAddToCart(product);
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
        })}
      </div>
      <button 
        onClick={() => navigate('/user/store')} 
        className="block mt-6 mx-auto border-2 gap-2 px-6 py-3 bg-white text-black  border-black/20 hover:bg-black hover:text-white text-sm transition-all duration-300"
      >
        View All →
      </button>
    </section>
  );
}

export default Featured;