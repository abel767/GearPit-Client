import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { removeFromWishlist } from '../../redux/Slices/wishlistSlice';
import { addToCart } from '../../redux/Slices/CartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlistItems = useSelector(state => state.wishlist.items);
  const userId = useSelector(state => state.user.user?._id);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/user/login');
    }
  }, [isAuthenticated, navigate]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      // First remove from backend (assuming you have an API endpoint)
      await axios.delete(`http://localhost:3000/user/wishlist/remove/${productId}`, {
        data: { userId }
      });
      
      // Then update Redux state
      dispatch(removeFromWishlist(productId));
      toast.success('Product removed from wishlist', {
        position: 'top-center',
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove product from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
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
        toast.error('This product is currently out of stock');
        return;
      }

      // Check if product already exists in cart
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

        // Remove from wishlist after successfully adding to cart
        await handleRemoveFromWishlist(product._id);

        toast.success(`${product.productName} added to cart!`, {
          position: 'top-center',
          autoClose: 2000
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add product to cart';
      toast.error(errorMessage);
    }
  };

  const getPriceDetails = (variants, offer) => {
    if (!variants || variants.length === 0) {
      return { originalPrice: 0, finalPrice: 0, discount: 0 };
    }
    
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

  const isProductOutOfStock = (variants) => {
    if (!variants || variants.length === 0) return true;
    return variants.every(variant => {
      const quantity = Number(variant.stock);
      return quantity <= 0 || isNaN(quantity);
    });
  };

  if (!isAuthenticated) {
    return null; // Or a loading state while redirecting
  }

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-medium text-center text-black mb-2">
          WISHLIST
        </h1>
        <p className="text-center text-gray-900 mb-12">
          SAVE YOUR FAVORITE PRODUCTS FOR LATER
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.map((item) => {
            const { originalPrice, finalPrice, discount } = getPriceDetails(item.variants, item.offer);
            const outOfStock = isProductOutOfStock(item.variants);
            
            return (
              <div key={item._id} className="flex flex-col bg-white rounded-lg shadow-sm">
                <div className="relative mb-4 bg-gray-50 p-4">
                  <img
                    src={item.images[0]}
                    alt={item.productName}
                    className="w-full h-auto aspect-square object-contain"
                  />
                  <button 
                    onClick={() => handleRemoveFromWishlist(item._id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-500/80 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  {outOfStock && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="px-4 pb-4">
                  <h2 className="text-sm font-medium text-black mb-2 line-clamp-2 h-10">
                    {item.productName}
                  </h2>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium">
                      ₹{finalPrice.toFixed(2)}
                    </span>
                    {discount > 0 && (
                      <>
                        <span className="text-sm line-through text-gray-500">
                          ₹{originalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-green-600">
                          {discount}% off
                        </span>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={outOfStock}
                    className={`w-full py-3 px-4 text-sm rounded transition-colors ${
                      outOfStock 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-900'
                    }`}
                  >
                    {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {wishlistItems.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-500 mb-4">
              Your wishlist is empty
            </p>
            <button 
              onClick={() => navigate('/store')}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}