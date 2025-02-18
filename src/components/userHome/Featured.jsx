import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
// import { addToCart } from '../../redux/Slices/CartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/Slices/wishlistSlice';
import axiosInstance from '../../api/axiosInstance';
const Featured = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const userId = useSelector(state => state.user.user?._id);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const wishlistItems = useSelector(state => state.wishlist.items);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/admin/productdata');
        const activeProducts = response.data
          .filter(product => !product.isDeleted && !product.isBlocked)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(activeProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= products.length ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? products.length - 1 : prevIndex - 1
    );
  };

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

  if (loading) {
    return <div className="flex justify-center items-center py-12">Loading...</div>;
  }

  const currentProduct = products[currentIndex];
  if (!currentProduct) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold uppercase mb-2">FEATURED PRODUCTS</h2>
        <p className="text-gray-600">
          Check out these newly arrived products in our inventory and some of the best selling gear amongst riders!
        </p>
      </div>

      {/* Product Display Section */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Product Card */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-8 items-center">
            {/* Product Info */}
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">{currentProduct.productName}</h3>
              <div className="text-2xl font-bold">
                ₹{currentProduct.variants[0]?.price.toFixed(2)}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate(`/user/product/${currentProduct._id}`)}
                  className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors"
                >
                  Buy
                </button>
                <button 
                  onClick={(e) => handleWishlistToggle(e, currentProduct)}
                  className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <Heart 
                    className={`w-6 h-6 ${
                      wishlistItems.some(item => item._id === currentProduct._id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative aspect-square">
              <img
                src={currentProduct.images[0]}
                alt={currentProduct.productName}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discover More Button */}
      <div className="text-center mt-12">
        <button 
          onClick={() => navigate('/user/store')}
          className="inline-flex items-center gap-2 border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
        >
          Discover more
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default Featured;