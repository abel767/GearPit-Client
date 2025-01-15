import { useState, useEffect } from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateQuantity, removeFromCart, addToCart } from '../../redux/Slices/CartSlice'
import axios from 'axios'

import { useNavigate } from 'react-router-dom'

export default function ShoppingCart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const items = useSelector(state => state.cart.items)
  const userId = useSelector(state => state.user.user?._id)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) {
        setInitialLoading(false)
        return
      }

      try {
        const response = await axios.get(`http://localhost:3000/user/cart/${userId}`)
        
        if (response.status === 200 && response.data?.items) {
          // Clear existing cart items and add fetched items
          dispatch({ type: 'cart/clearCart' })

          
          
          response.data.items.forEach(item => {

            if (!item.productId || !item.productId.variants) {
              console.warn('Invalid product data:', item);
              return; // Skip this item
            }
            
            const variant = item.productId.variants.find(v => v._id === item.variantId)
            if (variant) {
              dispatch(addToCart({
                product: {
                  _id: item.productId._id,
                  productName: item.productId.productName,
                  images: item.productId.images || []
                },
                quantity: item.quantity,
                variant: {
                  _id: variant._id,
                  price: variant.price || 0,
                  finalPrice: variant.finalPrice,
                  discount: variant.discount,
                  size: variant.size,
                  color: variant.color,
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
      const response = await axios.put('http://localhost:3000/user/cart/update', {
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
      const response = await axios.delete(`http://localhost:3000/user/cart/remove/${userId}/${productId}/${variantId}`)

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
  const discount = 100.00
  const total = subtotal - discount

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading cart...</div>
      </div>
    )
  }

  const handleCheckout = () => {
    const cartItems = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.finalPrice,
      name: item.name,
      size: item.size,
      color: item.color
    }));

    navigate('/user/Checkout', {
      state: {
        productDetails: {
          items: cartItems,
          subtotal,
          discount,
          total
        }
      }
    });
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Please login to view your cart</div>
      </div>
    )
  }


return(
  <div className="min-h-screen flex">
      {/* Left Column - Cart Items */}
      <div className="w-2/3 bg-white min-h-screen overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-xl font-normal">Cart</h1>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div 
                key={`${item.productId}-${item.variantId}`}
                className="flex items-center gap-4 py-4 border-b"
              >
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.size && `Size: ${item.size}`}
                        {item.color && ` • ${item.color}`}
                      </p>
                    </div>
                    <div className="text-sm">₹{(item.finalPrice * item.quantity).toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={loading}
                        onClick={() => handleRemoveItem(item.productId, item.variantId)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="flex items-center border rounded">
                      <button
                        disabled={loading}
                        onClick={() => handleUpdateQuantity(item.productId, item.variantId, -1, item.quantity)}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                      >
                        <MinusIcon size={14} />
                      </button>
                      <span className="px-3 py-1 text-sm border-x">{item.quantity}</span>
                      <button
                        disabled={loading || item.quantity >= item.stock}
                        onClick={() => handleUpdateQuantity(item.productId, item.variantId, 1, item.quantity)}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Right Column - Summary */}
      <div className="w-1/3 bg-minGrey min-h-screen">
        <div className="h-full flex flex-col justify-between p-8">
          <div>
            <h2 className="text-xl font-medium mb-8">Order Summary</h2>

            <div className="space-y-6 text-sm">
              <div className="flex justify-between pb-6 border-b">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pb-6 border-b">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between pb-6 border-b">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-red-600 font-medium">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-6">
                <span className="text-gray-900 font-medium">Total</span>
                <span className="text-3xl font-medium">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button 
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full py-4 bg-black text-white text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-20"
          >
            Proceed to Checkout
          </button>
          </div>

         
        </div>
      </div>
    </div>
  )
}