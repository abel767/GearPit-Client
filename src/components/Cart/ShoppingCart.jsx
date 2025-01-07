import { useState, useEffect } from 'react'
import { MinusIcon, PlusIcon, ShoppingCartIcon, TagIcon, Trash2Icon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateQuantity, removeFromCart, addToCart } from '../../redux/Slices/CartSlice'
import axios from 'axios'

export default function ShoppingCart() {
  const dispatch = useDispatch()
  const items = useSelector(state => state.cart.items)
  const userId = useSelector(state => state.user.user?._id)
  const [couponCode, setCouponCode] = useState('')
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
            const variant = item.productId.variants.find(v => v._id === item.variantId)
            if (variant) {
              dispatch(addToCart({
                product: {
                  _id: item.productId._id,
                  productName: item.productId.productName,
                  images: item.productId.images
                },
                quantity: item.quantity,
                variant: {
                  _id: variant._id,
                  price: variant.price,
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

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Please login to view your cart</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-full flex">
        <div className="flex w-full">
          {/* Cart Items Section */}
          <div className="flex-grow bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Shopping Cart</h1>
              <span className="text-gray-600">{items.length} Items</span>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-12 text-sm text-gray-500 pb-2 border-b">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.size && `Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        disabled={loading}
                        onClick={() => handleUpdateQuantity(item.productId, item.variantId, -1, item.quantity)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                      >
                        <MinusIcon size={16} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        disabled={loading || item.quantity >= item.stock}
                        onClick={() => handleUpdateQuantity(item.productId, item.variantId, 1, item.quantity)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    ₹{item.finalPrice.toFixed(2)}
                  </div>

                  <div className="col-span-2 text-right font-medium flex items-center justify-end">
                    <span className="mr-4">₹{(item.finalPrice * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => handleRemoveItem(item.productId, item.variantId)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      disabled={loading}
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-200">
                <ShoppingCartIcon size={20} className="mr-2" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Cart Totals Section */}
          <div className="w-96 bg-black text-white p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">Cart Totals</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sub Totals</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">Shipping</span>
                <span className="text-green-400 font-medium">Free</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">Discount</span>
                <span className="font-medium text-red-400">- ₹{discount.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm mb-3 text-gray-300">Apply Your GearPro Coupon Code Here for Exclusive Discounts</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon Code"
                    className="flex-1 px-3 py-2 rounded-l bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors duration-200 flex items-center">
                    <TagIcon size={16} className="mr-2" />
                    Apply
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
                </div>

                <button className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium flex items-center justify-center">
                  <ShoppingCartIcon size={20} className="mr-2" />
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}