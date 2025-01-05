import { Check, ShoppingBag, ArrowLeft, Package } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderNumber } = location.state || { orderNumber: 'N/A' };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse" />
              <div className="relative flex items-center justify-center w-full h-full rounded-full bg-green-500 transform transition-transform animate-bounce">
                <Check className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for choosing GearPit. Your order will be dispatched soon
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center text-gray-500">
                <Package className="w-5 h-5 mr-2" />
                <span>Order #{orderNumber}</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="text-green-600 font-medium">
                Estimated Delivery: 2-4 Days
              </div>
            </div>
          </div>
        
            {/* to check order use this in view order button url after orderhistory/${location.state?.orderId}  */}

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate(`/user/OrderHistory`)}
              className="flex items-center justify-center px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-colors duration-200"
            >
              <ShoppingBag  className="w-4 h-4 mr-2" />
              View Order
            </button>
            <button 
              onClick={() => navigate('/user/store')}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
            <Check className="w-4 h-4 mr-2" />
            Order confirmation sent to your email
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}