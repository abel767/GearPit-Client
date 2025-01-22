import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AlertCircle, X, RefreshCw, Clock } from 'lucide-react';
import { loadRazorpay } from '../../utils/LoadRazorPay';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryLoading, setRetryLoading] = useState(null); // Track which order is retrying
  const navigate = useNavigate();
  
  const userState = useSelector((state) => state.user);
  const userId = userState?.user?._id;

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'failed') {
      return 'text-red-500 bg-red-50';
    }
    
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-50';
      case 'PROCESSING':
        return 'text-orange-500 bg-orange-50';
      case 'SHIPPED':
        return 'text-blue-500 bg-blue-50';
      case 'DELIVERED':
        return 'text-green-500 bg-green-50';
      case 'CANCELLED':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    } else {
      setError("User not authenticated");
      setLoading(false);
    }
  }, [userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/user/orders/user/${userId}`);
      setOrders(response.data.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetails = (orderId) => {
    navigate('/user/OrderDetail', { state: { orderId } });
  };

  const isRetryWindowActive = (retryWindow) => {
    return retryWindow && new Date() < new Date(retryWindow);
  };

  const getTimeRemaining = (retryWindow) => {
    if (!retryWindow) return null;
    const now = new Date();
    const end = new Date(retryWindow);
    const diff = end - now;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRetryPayment = async (order) => {
    try {
      setRetryLoading(order._id);
      
      // Load Razorpay SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create new payment order
      const response = await axiosInstance.post(`/user/orders/${order._id}/retry-payment`);
      const { orderId: razorpayOrderId, amount, currency } = response.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "Your Store",
        description: `Retry Payment for Order #${order.orderNumber}`,
        prefill: {
          name: userState?.user?.name,
          email: userState?.user?.email,
        },
        handler: async function (response) {
          try {
            await axiosInstance.post('/user/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });
            
            // Refresh orders after successful payment
            fetchOrders();
          } catch (error) {
            setError('Payment verification failed. Please try again.');
            console.error('error in payment verification', error)
          }
        },
        modal: {
          ondismiss: function() {
            setRetryLoading(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setError('Failed to initiate payment retry. Please try again.');
      console.error('Payment retry error:', error);
    } finally {
      setRetryLoading(null);
    }
  };

  if (!userState.isAuthenticated) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">Please log in to view your order history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto -mx-1.5 -my-1.5 p-1.5"
            >
              <X className="h-4 w-4 text-red-500 hover:text-red-600" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 rounded-t-lg">
          <div>ORDER ID</div>
          <div className="col-span-2">PRODUCT NAME</div>
          <div>STATUS</div>
          <div>DATE</div>
          <div>TOTAL</div>
          <div>ACTION</div>
        </div>

        <div className="divide-y">
          {orders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="grid grid-cols-7 gap-4 px-6 py-4 items-center">
                <div className="text-sm font-medium">{order.orderNumber}</div>
                <div className="text-sm col-span-2">
                  {order.items.map(item => item.productId.productName).join(', ')}
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status, order.paymentStatus)}`}>
                    {order.paymentStatus === 'failed' ? 'Payment Failed' : order.status}
                  </span>
                  {order.paymentStatus === 'failed' && isRetryWindowActive(order.paymentRetryWindow) && (
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{getTimeRemaining(order.paymentRetryWindow)}</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-sm">
                  ₹{order.totalAmount.toLocaleString('en-IN')} ({order.items.length} Items)
                </div>
                <div>
                  {order.paymentStatus === 'failed' && isRetryWindowActive(order.paymentRetryWindow) ? (
                    <button
                      onClick={() => handleRetryPayment(order)}
                      disabled={retryLoading === order._id}
                      className={`px-3 py-1 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-600 flex items-center ${
                        retryLoading === order._id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {retryLoading === order._id ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : null}
                      Retry Payment
                    </button>
                  ) : (
                    <button
                      onClick={() => handleViewOrderDetails(order._id)}
                      className="px-3 py-1 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border border-blue-600"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;