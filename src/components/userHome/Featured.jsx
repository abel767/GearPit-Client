import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {products.map((product) => {
          const outOfStock = isProductOutOfStock(product.variants);
          const { originalPrice, finalPrice, discount } = getPriceDetails(product.variants, product.offer);
          
          return (
            <div key={product._id} className="group relative bg-white p-2 rounded-lg shadow-sm">
              <button 
                onClick={(e) => handleWishlistToggle(e, product)}
                className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow-sm hover:bg-gray-50"
              >
                <Heart 
                  className={`w-4 h-4 ${
                    wishlistItems.some(item => item._id === product._id)
                      ? 'text-red-500 fill-current'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                />
              </button>

              <div className="relative aspect-square mb-2">
                <img
                  src={product.images[0]}
                  alt={product.productName}
                  className={`w-full h-full object-contain ${outOfStock ? 'opacity-60' : ''}`}
                />
                {outOfStock && (
                  <span className="absolute top-1 left-1 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-xs font-medium mb-1 line-clamp-2 h-8">
                  {product.productName}
                </h3>
                
                <div className="mb-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 justify-center">
                    <span className={`text-sm font-bold ${outOfStock ? 'text-gray-500' : 'text-gray-900'}`}>
                      ₹{finalPrice.toFixed(2)}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs text-gray-500 line-through">
                        ₹{originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && !outOfStock && (
                    <span className="text-xs text-green-600">{discount}% off</span>
                  )}
                </div>

                <div className="flex gap-1 mt-1">
                  <button 
                    onClick={() => !outOfStock && handleAddToCart(product)}
                    disabled={outOfStock}
                    className={`flex-1 py-1 px-2 text-xs rounded ${
                      outOfStock 
                        ? 'bg-red-50 text-red-500 border border-red-300'
                        : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  >
                    {outOfStock ? 'Out of Stock' : 'Add'}
                  </button>
                  <button 
                    onClick={() => navigate(`/user/product/${product._id}`)}
                    className="flex-1 bg-black hover:bg-gray-800 text-white py-1 px-2 text-xs rounded"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button 
        onClick={() => navigate('/user/store')} 
        className="block mt-6 mx-auto border-2 border-black bg-white hover:bg-black text-black hover:text-white py-2 px-4 rounded-md text-sm transition-all duration-300"
      >
        View All →
      </button>
    </section>
  );
}

export default Featured;