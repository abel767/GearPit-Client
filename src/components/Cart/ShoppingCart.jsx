import { useState, useEffect } from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateQuantity, removeFromCart, addToCart } from '../../redux/Slices/CartSlice'
import axiosInstance from '../../api/axiosInstance'
import { useNavigate } from 'react-router-dom'

export default function ShoppingCart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(state => state.cart.items)
  const userId = useSelector(state => state.user.user?._id)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) {
        setInitialLoading(false)
        return
      }
  
      try {
        const response = await axiosInstance.get(`/user/cart/${userId}`)
        console.log('Cart API Response:', response.data)
        
        if (response.status === 200 && response.data?.items) {
          dispatch({ type: 'cart/clearCart' })
          
          response.data.items.forEach(item => {
            if (!item.productId || !item.productId.variants) {
              console.warn('Invalid product data:', item)
              return
            }
            
            const variant = item.productId.variants.find(
              v => v._id.toString() === item.variantId.toString()
            )
            console.log('Found variant:', variant, 'for variantId:', item.variantId)
            
            if (variant) {
              dispatch(addToCart({
                product: {
                  _id: item.productId._id,
                  productName: item.productId.productName,
                  images: item.productId.images || [],
                },
                quantity: Math.min(item.quantity, variant.stock),
                variant: {
                  _id: variant._id,
                  price: variant.price || 0,
                  finalPrice: variant.finalPrice,
                  discount: variant.discount,
                  size: variant.size,
                  stock: variant.stock
                }
              }))
            }
          })
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
        alert('Failed to load cart items')
      } finally {
        setInitialLoading(false)
      }
    }
  
    fetchCartItems()
  }, [userId, dispatch])



  const handleUpdateQuantity = async (productId, variantId, change, currentQuantity) => {
    const newQuantity = Math.max(1, currentQuantity + change)
    
    try {
      setLoading(true)
      const response = await axiosInstance.put('/user/cart/update', {
        userId,
        productId,
        variantId,
        quantity: newQuantity
      })

      if (response.status === 200) {
        dispatch(updateQuantity({
          productId,
          variantId,
          quantity: newQuantity
        }))
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert('Failed to update quantity')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (productId, variantId) => {
    try {
      setLoading(true)
      const response = await axiosInstance.delete(`/user/cart/remove/${userId}/${productId}/${variantId}`)

      if (response.status === 200) {
        dispatch(removeFromCart({ productId, variantId }))
      }
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Failed to remove item')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0)
  const total = subtotal

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading cart...</div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Please login to view your cart</div>
      </div>
    )
  }

  // Group items by product ID, maintaining all variants
  const groupedItems = items.reduce((acc, item) => {
    const key = item.productId
    if (!acc[key]) {
      acc[key] = []
    }
    // Ensure we're adding each unique variant
    if (!acc[key].some(existingItem => existingItem.variantId === item.variantId)) {
      acc[key].push(item)
    }
    return acc
  }, {})

  const handleCheckout = () => {
    const cartItems = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.finalPrice,
      name: item.name,
      size: item.size,
    }))

    navigate('/user/Checkout', {
      state: {
        productDetails: {
          items: cartItems,
          subtotal,
          total
        }
      }
    })
  }

  

  
  return (
 <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Cart Items Section */}
      <div className="w-full lg:w-2/3 bg-white min-h-screen overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl font-normal">Cart</h1>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedItems).map(([productId, productVariants]) => (
              <div key={productId} className="space-y-4">
                {/* Product header */}
                <h3 className="text-lg font-medium border-b pb-2">
                  {productVariants[0].name}
                </h3>
                
                {/* Product variants */}
                {productVariants.map((item) => (
                  <div 
                    key={`${item.productId}-${item.variantId}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 pl-4 border-b last:border-0"
                  >
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-500">
                            Size: {item.size}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Price: ₹{item.finalPrice.toFixed(2)}
                          </p>
                          {/* Add stock status messages */}
                          {item.quantity > item.stock && (
                            <p className="text-red-500 text-sm mt-1">
                              Stock has been updated. Quantity adjusted to available stock.
                            </p>
                          )}
                          {item.stock === 0 && (
                            <p className="text-red-500 text-sm mt-1">
                              This item is currently out of stock
                            </p>
                          )}
                        </div>
                        <div className="text-sm mt-2 sm:mt-0">
                          ₹{(item.finalPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-3 sm:gap-0">
                        <button
                          disabled={loading}
                          onClick={() => handleRemoveItem(item.productId, item.variantId)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Remove
                        </button>
                        
                        <div className="flex items-center border rounded">
                          <button
                            disabled={loading || item.stock === 0}
                            onClick={() => handleUpdateQuantity(item.productId, item.variantId, -1, item.quantity)}
                            className={`px-2 py-1 text-gray-500 hover:bg-gray-50 ${
                              item.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <MinusIcon size={14} />
                          </button>
                          <span className="px-3 py-1 text-sm border-x">
                            {item.quantity}
                          </span>
                          <button
                            disabled={loading || item.quantity >= item.stock || item.stock === 0}
                            onClick={() => handleUpdateQuantity(item.productId, item.variantId, 1, item.quantity)}
                            className={`px-2 py-1 text-gray-500 hover:bg-gray-50 ${
                              (item.quantity >= item.stock || item.stock === 0) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <PlusIcon size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/user/store')} 
            className="mt-6 text-sm text-gray-600 hover:text-gray-800"
          >
            Continue shopping
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="w-full lg:w-1/3 bg-minGrey">
        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl font-medium mb-6">Order Summary</h2>

          <div className="space-y-4 sm:space-y-6 text-sm">
            <div className="flex justify-between pb-4 sm:pb-6 border-b">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between pb-4 sm:pb-6 border-b">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>

            <div className="flex justify-between items-center pt-4 sm:pt-6">
              <span className="text-gray-900 font-medium">Total</span>
              <span className="text-2xl sm:text-3xl font-medium">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 sm:mt-20">
            <button 
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full py-4 bg-black text-white text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}