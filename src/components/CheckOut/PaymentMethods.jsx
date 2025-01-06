import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CreditCard, Wallet, ArrowLeft, ShoppingBag, DollarSign } from 'lucide-react';

export default function PaymentMethod() {
  const [selectedPayment, setSelectedPayment] = useState('card');
  // const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    codFee: 0,
    total: 0
  });

  const location = useLocation();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user); // Access user from user.user
  const productDetails = location.state?.productDetails;

  // Redirect if not authenticated or no product details
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/user/login', { 
        state: { 
          from: location.pathname,
          productDetails 
        },
        replace: true // Use replace to prevent back navigation to payment page when not authenticated
      });
      return;
    }

    if (!productDetails) {
      navigate('/user/store', { replace: true });
      return;
    }

    calculateOrderSummary();
  }, [isAuthenticated, user, productDetails, navigate, location.pathname]);

  // Payment methods configuration
  const paymentMethods = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Pay securely with your card'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.36,12l-8.48,8.48L4.4,12l8.48-8.48L21.36,12z M12.88,17.76l4.24-4.24l-4.24-4.24l-4.24,4.24L12.88,17.76z"/>
      </svg>,
      description: 'Pay using UPI ID'
    },
    {
      id: 'wallet',
      name: 'My Wallet',
      icon: <Wallet className="w-5 h-5" />,
      description: 'Pay from your wallet balance'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Pay when you receive your order',
      badge: '+ ₹49 COD Fee'
    }
  ];

  const calculateOrderSummary = () => {
    if (!productDetails) return;

    const subtotal = productDetails.price * productDetails.quantity;
    const shipping = 0;
    const codFee = selectedPayment === 'cod' ? 49 : 0;
    const discount = calculateDiscount(subtotal, couponCode);
    const total = subtotal + shipping + codFee - discount;

    setOrderSummary({
      subtotal,
      shipping,
      discount,
      codFee,
      total
    });
  };

  const calculateDiscount = (subtotal, code) => {
    if (code === 'WELCOME10') {
      return Math.min(subtotal * 0.1, 100);
    }
    return productDetails?.discount || 0;
  };

  const handleSubmitOrder = async () => {
    try {
      // Double-check authentication before submitting
      if (!isAuthenticated || !user?._id) {
        navigate('/user/login', { 
          state: { 
            from: location.pathname,
            productDetails 
          },
          replace: true
        });
        return;
      }

      if (!productDetails?.productId || !productDetails?.variantId) {
        throw new Error('Invalid product details');
      }

      setIsSubmitting(true);

      const orderData = {
        userId: user._id,
        items: [{
          productId: productDetails.productId,
          variantId: productDetails.variantId,
          quantity: productDetails.quantity,
          price: productDetails.price
        }],
        paymentMethod: selectedPayment === 'cod' ? 'cod' : 'online',
        totalAmount: orderSummary.total,
        ...(couponCode && { couponCode })
      };

      const response = await fetch('http://localhost:3000/user/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      navigate('/user/PaymentSuccess', {
        state: {
          orderId: data.data.orderId,
          orderNumber: data.data.orderNumber
        },
        replace: true
      });

    } catch (error) {
      console.error('Order submission failed:', error);
      alert(error.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not authenticated or no product details, render nothing while redirecting
  if (!isAuthenticated || !user || !productDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Product
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Options Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-6 h-6 text-gray-800" />
                  <h2 className="text-xl font-semibold text-gray-800">Payment Options</h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer
                      ${selectedPayment === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <div className="ml-4 flex items-center justify-between flex-1">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                          {method.icon}
                        </span>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                      </div>
                      {method.badge && (
                        <span className="ml-4 text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {method.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{orderSummary.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>

              {selectedPayment === 'cod' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">COD Fee</span>
                  <span>₹{orderSummary.codFee.toFixed(2)}</span>
                </div>
              )}

              {orderSummary.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-red-600">-₹{orderSummary.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-xl font-bold">₹{orderSummary.total.toFixed(2)}</span>
                </div>

                <button 
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
