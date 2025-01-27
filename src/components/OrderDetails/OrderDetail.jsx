import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { ArrowLeft, Package, Truck, CheckCircle, Home, AlertCircle, Star, XCircle, AlertTriangle, X } from 'lucide-react';

const Dialog = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg max-w-md w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {children}
      </div>
    </div>
  );
};

const OrderDetailAndTrack = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reviews, setReviews] = useState({});
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/user/orders/detail/${orderId}`);
      setOrder(response.data.data);
      if (response.data.data.items[0]?.productId.images[0]) {
        setSelectedImage(response.data.data.items[0].productId.images[0]);
      }
      
      // Initialize reviews state
      const initialReviews = {};
      response.data.data.items.forEach(item => {
        initialReviews[item.productId._id] = {
          rating: 0,
          comment: ''
        };
      });
      setReviews(initialReviews);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };


  const handleReviewSubmit = async (productId) => {
    try {
      await axiosInstance.post(`/user/reviews`, {
        productId,
        orderId,
        rating: reviews[productId].rating,
        comment: reviews[productId].comment
      });
      alert('Review submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const StarRating = ({ productId }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setReviews(prev => ({
              ...prev,
              [productId]: { ...prev[productId], rating: star }
            }))}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 ${
                star <= reviews[productId]?.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-500">Order not found</div>
      </div>
    );
  }

  const getTrackingStatus = () => {
    const statusMap = {
      'PENDING': 1,
      'PROCESSING': 2,
      'SHIPPED': 3,
      'DELIVERED': 4,
      'CANCELLED': 0
    };
    return statusMap[order.status.toUpperCase()] || 0;
  };

  const getTrackingPercentage = () => {
    const status = getTrackingStatus();
    if (status === 0) return 0;
    return ((status - 1) * 33.33);
  };

  const getStepStatus = (stepNumber) => {
    const currentStatus = getTrackingStatus();
    if (currentStatus === 0) return 'cancelled';
    if (stepNumber < currentStatus) return 'completed';
    if (stepNumber === currentStatus) return 'current';
    return 'pending';
  };

  const getStepColor = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
      case 'current':
        return 'bg-green-600 text-white';
      case 'cancelled':
        return 'bg-red-600 text-white';
      default:
        return 'bg-white border-2 text-gray-400';
    }
  };

  const getActivityList = () => {
    const activities = [];
    const statusHistory = order.statusHistory || [];
    
    // Add current status if not cancelled
    if (order.status.toUpperCase() !== 'CANCELLED') {
      activities.push({
        message: `Order ${order.status.toLowerCase()}`,
        time: new Date(order.updatedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        icon: CheckCircle,
        color: "text-green-500"
      });
    }

    // Add cancelled status if applicable
    if (order.status.toUpperCase() === 'CANCELLED') {
      activities.push({
        message: "Order cancelled",
        time: new Date(order.updatedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        icon: AlertCircle,
        color: "text-red-500"
      });
    }

    // Add order placed activity
    activities.push({
      message: "Order placed successfully",
      time: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      icon: Package,
      color: "text-blue-500"
    });

    return activities;
  };


  const handleCancelOrder = async () => {
    try {
      setCancellingOrder(true);
      await axiosInstance.put(`/user/orders/${orderId}/cancel`);
      setShowCancelDialog(false);
      fetchOrderDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrder(false);
    }
  };

  const CancelOrderButton = () => {
    if (!['PENDING', 'PROCESSING'].includes(order.status.toUpperCase())) {
      return null;
    }
    
    return (
      <div className="bg-white rounded-lg p-6">
        <button
          onClick={() => setShowCancelDialog(true)}
          className="w-full py-3 text-red-600 border-2 border-red-600 rounded-lg transition-colors font-medium hover:bg-red-50 inline-flex items-center justify-center gap-2"
          disabled={cancellingOrder}
        >
          <XCircle className="h-5 w-5" />
          {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
        </button>

        <Dialog isOpen={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Cancel Order</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                No, keep my order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancellingOrder ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Yes, cancel order
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/OrderHistory')} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-medium">ORDER DETAILS</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Order Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-gray-600">#{order.orderNumber}</div>
            <div className="text-sm text-gray-500 mt-1">
              {order.items.length} Products • Order Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="text-2xl font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</div>
        </div>

        {/* Order Tracking */}
          <div className="bg-white rounded-lg p-6 mb-8">
          <div className="relative flex justify-between">
            {[
              { label: 'Order Placed', icon: Package, step: 1 },
              { label: 'Processing', icon: Package, step: 2 },
              { label: 'Shipped', icon: Truck, step: 3 },
              { label: 'Delivered', icon: Home, step: 4 }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  getStepColor(getStepStatus(step.step))
                }`}>
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="text-xs mt-2">{step.label}</div>
              </div>
            ))}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className={`h-full transition-all duration-500 ${
                  order.status.toUpperCase() === 'CANCELLED' ? 'bg-red-600' : 'bg-green-600'
                }`}
                style={{ width: `${getTrackingPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Product Details */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="font-medium mb-4">Products ({order.items.length})</h2>
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex gap-4 items-start">
                      {item.productId.images?.[0] && (
                        <img
                          src={item.productId.images[0]}
                          alt={item.productId.productName}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.productId.productName}</div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                          <div>
                            <div className="text-gray-500">Quantity</div>
                            <div>{item.quantity}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Price</div>
                            <div>₹{item.price.toLocaleString('en-IN')}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total</div>
                            <div>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Review Section */}
                    {order.status === 'DELIVERED' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Write a Review</h3>
                        <StarRating productId={item.productId._id} />
                        <textarea
                          value={reviews[item.productId._id]?.comment || ''}
                          onChange={(e) => setReviews(prev => ({
                            ...prev,
                            [item.productId._id]: { ...prev[item.productId._id], comment: e.target.value }
                          }))}
                          placeholder="Write your review here..."
                          className="mt-2 w-full p-2 border rounded-lg"
                          rows="3"
                        />
                        <button
                          onClick={() => handleReviewSubmit(item.productId._id)}
                          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Submit Review
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Activity */}
            <div className="bg-white rounded-lg p-6">
          <h2 className="font-medium mb-4">Order Activity</h2>
          <div className="space-y-4">
            {getActivityList().map((activity, idx) => (
              <div key={idx} className="flex gap-3">
                <activity.icon className={`h-5 w-5 ${activity.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <div className="text-sm">{activity.message}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Product Display */}
            <div className="bg-white rounded-lg p-6">
              <div className="max-w-4xl mx-auto">
                {selectedImage && (
                  <div className="aspect-[4/3] md:aspect-[16/9] mb-4">
                    <img
                      src={selectedImage}
                      alt="Product"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                )}
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {order.items.map((item, idx) => (
                    item.productId.images?.[0] && (
                      <button 
                        key={idx}
                        className={`flex-shrink-0 w-24 h-24 rounded-lg border-2 p-1 transition-colors ${
                          selectedImage === item.productId.images[0] 
                            ? 'border-green-500' 
                            : 'border-transparent hover:border-green-500'
                        }`}
                        onClick={() => setSelectedImage(item.productId.images[0])}
                      >
                        <img
                          src={item.productId.images[0]}
                          alt={item.productId.productName}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
 {/* Shipping and Price Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="font-medium mb-4">Shipment Address</h2>
                <div className="space-y-2 text-sm">
                  <div className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                  <div className="text-gray-600">
                    {order.shippingAddress.address}
                  </div>
                  <div className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </div>
                  <div className="text-gray-600">Phone: {order.shippingAddress.phoneNumber}</div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="font-medium mb-4">Price Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items Total</span>
                    <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>���{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            {['PENDING', 'PROCESSING'].includes(order.status.toUpperCase()) && (
  <div className="bg-white rounded-lg p-6">
            <CancelOrderButton />
            </div>
)}
          </div>
        </div>
      </main>
    </div>
  );
};
export default OrderDetailAndTrack;