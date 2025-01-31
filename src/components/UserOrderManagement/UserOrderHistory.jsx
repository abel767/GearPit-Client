import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AlertCircle, X, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { loadRazorpay } from '../../utils/LoadRazorPay';
import toast from 'react-hot-toast';
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryLoading, setRetryLoading] = useState(null);
  const navigate = useNavigate();
  
  const userState = useSelector((state) => state.user);
  const userId = userState?.user?._id;

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'failed') {
      return 'text-red-600 bg-red-50 font-semibold';
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
      console.log('Fetching orders for userId:', userId);
      const response = await axiosInstance.get(`/user/orders/user/${userId}`);
      console.log('Orders API Response:', response.data);
      
      const sortedOrders = response.data.data.sort((a, b) => {
        if (a.paymentStatus === 'failed' && b.paymentStatus !== 'failed') return -1;
        if (b.paymentStatus === 'failed' && a.paymentStatus !== 'failed') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  
      console.log('Sorted orders:', sortedOrders);
      console.log('Orders with failed payments:', sortedOrders.filter(order => order.paymentStatus === 'failed'));
      
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      console.log('Failed orders:', orders.filter(order => order.paymentStatus === 'failed'));
    }
  }, [orders]);

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
      
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error('Failed to load payment gateway');
  
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
            await axiosInstance.post(`/user/orders/${order._id}/verify-retry-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });
            
            toast.success('Payment successful');
            await fetchOrders(); // Refresh order list
            
          } catch (error) {
            setError('Payment verification failed');
            console.error(error);
          }
        },
        modal: {
          ondismiss: () => setRetryLoading(null)
        }
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setError('Failed to initiate payment retry');
      console.error(error);
    } finally {
      setRetryLoading(null);
    }
  };

  if (!userState.isAuthenticated) {
    return (
      <div className="w-full min-h-screen p-4 flex justify-center items-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full max-w-lg">
          <p className="text-yellow-700 text-center">Please log in to view your order history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const failedOrders = orders.filter(order => order.paymentStatus === 'failed');

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-full mx-auto p-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
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

        {/* Failed Orders Section */}
        {failedOrders.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">Payment Pending</h2>
              <p className="text-sm text-red-700">
                You have {failedOrders.length} order(s) with payment issues. Please complete the payment to avoid cancellation.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="hidden md:grid md:grid-cols-7 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500">
            <div>ORDER ID</div>
            <div className="col-span-2">PRODUCT NAME</div>
            <div>STATUS</div>
            <div>DATE</div>
            <div>TOTAL</div>
            <div>ACTION</div>
          </div>

          <div className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              orders.map((order) => (
                <div 
                key={order._id} 
                className={`flex flex-col md:grid md:grid-cols-7 gap-2 md:gap-4 px-4 md:px-6 py-4 items-start md:items-center ${
                  order.paymentStatus === 'failed' ? 'bg-red-25 border-l-4 border-red-500' : ''
                }`}
              >
                  {/* Order Details Rendering */}
                  <div className="w-full md:w-auto flex flex-col space-y-1">
                    <span className="md:hidden text-xs text-gray-500">Order ID:</span>
                    <span className="text-sm font-medium">{order.orderNumber}</span>
                  </div>
                  
                  <div className="w-full md:w-auto col-span-2 flex flex-col space-y-1">
                    <span className="md:hidden text-xs text-gray-500">Products:</span>
                    <span className="text-sm">{order.items.map(item => item.productId.productName).join(', ')}</span>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-col space-y-1">
                    <span className="md:hidden text-xs text-gray-500">Status:</span>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status, order.paymentStatus)}`}>
                        {order.paymentStatus === 'failed' ? 'Payment Failed' : order.status}
                      </span>
                      {order.paymentStatus === 'failed' && isRetryWindowActive(order.paymentRetryWindow) && (
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Retry Available: {getTimeRemaining(order.paymentRetryWindow)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-col space-y-1">
                    <span className="md:hidden text-xs text-gray-500">Date:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-col space-y-1">
                    <span className="md:hidden text-xs text-gray-500">Total:</span>
                    <span className="text-sm">₹{order.totalAmount.toLocaleString('en-IN')} ({order.items.length} Items)</span>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-col space-y-1">
                    <span className="md:hidden text-xs text-gray-500">Action:</span>
                    {order.paymentStatus === 'failed' && isRetryWindowActive(order.paymentRetryWindow) ? (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        disabled={retryLoading === order._id}
                        className={`w-full md:w-auto px-3 py-1 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-600 flex items-center justify-center ${
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
                        className="w-full md:w-auto px-3 py-1 text-sm font-medium bg-white text-black hover:bg-black hover:text-white transition-colors border border-black"
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
    </div>
  );
};

export default OrderHistory;