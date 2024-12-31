import { useState } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon, TagIcon } from 'lucide-react';
import {useNavigate} from 'react-router-dom' 
export default function ShoppingCart() {

    const navigate = useNavigate()
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'MT-X Pro Helmet',
      image: '/placeholder.svg',
      price: 15100.00,
      quantity: 2,
      color: 'Yellow'
    },
    {
      id: 2,
      name: 'Racing Airbag Safety Utility',
      image: '/placeholder.svg',
      price: 3500.00,
      quantity: 3,
      color: 'Black'
    },
    {
      id: 3,
      name: 'Tech Race motorcycle Jacket',
      image: '/placeholder.svg',
      price: 7990.00,
      quantity: 1,
      color: 'Black'
    }
  ]);

  const [couponCode, setCouponCode] = useState('');

  const updateQuantity = (id, change) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 100.00;
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
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
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Color: {item.color}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                      >
                        <MinusIcon size={16} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    ₹{item.price.toFixed(2)}
                  </div>

                  <div className="col-span-2 text-right font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button onClick={()=>navigate('/user/store')}  className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-200">
                <ShoppingCartIcon size={20} className="mr-2" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Cart Totals Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-lg shadow-lg">
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
    </div>
  );
}

