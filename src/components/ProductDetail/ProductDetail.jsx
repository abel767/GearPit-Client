import { useState, useEffect } from 'react';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('DETAILS');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // First, fetch all products
        const response = await fetch('http://localhost:3000/admin/productdata', {
          credentials: 'include'  // Added credentials
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allProducts = await response.json();
        console.log('All products:', allProducts);
        
        // Find the specific product by ID
        const foundProduct = allProducts.find(p => p._id === id);
        console.log('Found product:', foundProduct);
        
        if (!foundProduct) {
          throw new Error('Product not found');
        }
        
        setProduct(foundProduct);
        if (foundProduct.variants && foundProduct.variants.length > 0) {
          setSelectedVariant(foundProduct.variants[0]);
        }

        // Set related products from the same data
        const filtered = allProducts
          .filter(p => p._id !== id && !p.isDeleted)
          .slice(0, 5)
          .map(p => ({
            id: p._id,
            name: p.productName,
            price: p.variants[0]?.price || 0,
            image: p.images[0] || '/placeholder.svg?height=200&width=200',
          }));
        setRelatedProducts(filtered);
        
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button 
          onClick={() => navigate('/store')}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Go Back to Store
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="mb-4">Product not found</p>
        <button 
          onClick={() => navigate('/store')}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Go Back to Store
        </button>
      </div>
    );
  }

 


  const getFinalPrice = (variant) => {
    return variant.finalPrice || variant.price * (1 - (variant.discount || 0) / 100);
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`w-20 h-20 border-2 ${
                  selectedImage === index ? 'border-black' : 'border-gray-200'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image}
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="flex-1">
            <img
              src={product.images[selectedImage]}
              alt="Main product view"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.productName}</h1>
          <div className="flex items-center gap-1 mb-4">
            <div className="flex">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <Star className="w-4 h-4 fill-gray-200 text-gray-200" />
            </div>
            <span className="text-sm text-gray-500">(1,256 reviews)</span>
          </div>
          
          {selectedVariant && (
            <>
              <p className="text-2xl font-bold mb-6">
                ₹{getFinalPrice(selectedVariant).toFixed(2)}
                {selectedVariant.discount > 0 && (
                  <>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{selectedVariant.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 ml-2">
                      {selectedVariant.discount}% off
                    </span>
                  </>
                )}
              </p>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Size</h3>
                <div className="flex gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      className={`w-10 h-10 border ${
                        selectedVariant._id === variant._id
                          ? 'border-black'
                          : 'border-gray-300'
                      } hover:border-black flex items-center justify-center ${
                        variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => variant.stock > 0 && setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">QTY</h3>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 border border-gray-300 hover:bg-gray-100"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedVariant.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(selectedVariant.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border border-gray-300 p-2"
                  />
                  <button
                    className="p-2 border border-gray-300 hover:bg-gray-100"
                    onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-red-500 mt-1">
                  {selectedVariant.stock} pieces available
                </p>
              </div>
            </>
          )}

          <div className="flex gap-4 mb-8">
            <button className="flex-1 bg-black text-white py-3 px-6 hover:bg-gray-800 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              ADD TO CART
            </button>
            <button 
  onClick={() => navigate('/user/Checkout', {
    state: {
      productDetails: {
        productId: product._id,
        productName: product.productName,
        price: getFinalPrice(selectedVariant),
        quantity,
        variantId: selectedVariant._id,
        size: selectedVariant.size,
        discount: selectedVariant.discount,
      }
    }
  })} 
  className="flex-1 border border-black py-3 px-6 hover:bg-gray-100"
>
  BUY NOW
</button>
          </div>

          <div className="border-t pt-8">
            <div className="flex gap-4 mb-4">
              <button
                className={`px-4 py-2 ${
                  activeTab === 'DETAILS'
                    ? 'border-b-2 border-black'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('DETAILS')}
              >
                DETAILS
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'REVIEWS'
                    ? 'border-b-2 border-black'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('REVIEWS')}
              >
                REVIEWS
              </button>
            </div>
            
            {activeTab === 'DETAILS' && (
              <div className="text-sm text-gray-600 space-y-4">
                <p>{product.description}</p>
              </div>
            )}
            
            {activeTab === 'REVIEWS' && (
              <div className="text-sm text-gray-600">
                <p>Customer reviews content would go here...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">RELATED PRODUCTS</h2>
          <button className="text-sm font-medium">SHOW MORE</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {relatedProducts.map((product) => (
            <div key={product.id} className="group">
              <div className="aspect-square mb-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-medium mb-1">{product.name}</h3>
              <p className="text-sm font-bold">₹{product.price.toFixed(2)}</p>
              <button className="w-full mt-2 bg-black text-white py-2 text-sm">
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}