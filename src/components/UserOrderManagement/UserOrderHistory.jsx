import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { AlertCircle, X } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrders, setCancellingOrders] = useState(new Set());
  
  // Update to use user slice instead of auth
  const userState = useSelector((state) => state.user);
  const userId = userState?.user?._id;
  
  const BASE_URL = 'http://localhost:3000';

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
      const response = await axios.get(`${BASE_URL}/user/orders/user/${userId}`);
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

  const handleCancelOrder = async (orderId) => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      setCancellingOrders(prev => new Set([...prev, orderId]));
      
      const response = await axios.put(`${BASE_URL}/user/orders/${orderId}/cancel`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'CANCELLED' }
            : order
        ));
        setError(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel order. Please try again later.';
      setError(`Error cancelling order #${orderId}: ${errorMessage}`);
      console.error('Error cancelling order:', {
        orderId,
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setCancellingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
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
        <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 rounded-t-lg">
          <div>ORDER ID</div>
          <div>PRODUCT NAME</div>
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
              <div key={order._id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center">
                <div className="text-sm font-medium">{order.orderNumber}</div>
                <div className="text-sm">
                  {order.items.map(item => item.productId.productName).join(', ')}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED'
                        ? 'text-green-600 bg-green-50'
                        : order.status === 'CANCELLED'
                        ? 'text-red-600 bg-red-50'
                        : 'text-blue-600 bg-blue-50'
                    }`}
                  >
                    {order.status}
                  </span>
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
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingOrders.has(order._id)}
                      className={`px-3 py-1 text-sm font-medium text-white rounded-full transition-colors ${
                        cancellingOrders.has(order._id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {cancellingOrders.has(order._id) ? 'Cancelling...' : 'Cancel'}
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