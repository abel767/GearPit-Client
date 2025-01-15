import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CreditCard, Wallet, DollarSign, X } from 'lucide-react';
import { fetchAddresses } from '../../redux/Slices/addressSlice';
import { useRazorpay } from '../../hooks/useRazorpay';

const UPIIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.36,12l-8.48,8.48L4.4,12l8.48-8.48L21.36,12z M12.88,17.76l4.24-4.24l-4.24-4.24l-4.24,4.24L12.88,17.76z"/>
  </svg>
);

export default function PaymentMethod() {
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    codFee: 0,
    total: 0
  });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);
  const productDetails = location.state?.productDetails;
  const cartDetails = location.state?.productDetails;
  const { addresses, loading: addressesLoading, error: addressesError } = useSelector((state) => state.address);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/user/login', { 
        state: { 
          from: location.pathname,
          productDetails,
          cartDetails 
        },
        replace: true
      });
      return;
    }

    if (!productDetails && !cartDetails?.items?.length) {
      navigate('/user/store', { replace: true });
      return;
    }

    if (user?._id) {
      dispatch(fetchAddresses(user._id));
    }

    calculateOrderSummary();
  }, [isAuthenticated, user, cartDetails, productDetails, navigate, location.pathname, dispatch]);

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0]._id);
      setSelectedAddress(addresses[0]);
    }
  }, [addresses, selectedAddressId]);

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
      icon: <UPIIcon />,
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

  const validateAndApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
  
    try {
      console.log('Sending coupon validation request:', {
        code: couponCode.trim().toUpperCase(),
        cartTotal: orderSummary.subtotal
      });
  
      const validateResponse = await fetch('http://localhost:3000/user/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal: orderSummary.subtotal
        })
      });
  
      console.log('Validation response status:', validateResponse.status);
  
      const validateData = await validateResponse.json();
      console.log('Validation response data:', validateData);
  
      if (validateResponse.status === 404) {
        throw new Error('Invalid or expired coupon');
      }
  
      if (!validateResponse.ok) {
        throw new Error(validateData.message || 'Failed to validate coupon');
      }
  
      if (!validateData.success) {
        setCouponError(validateData.message);
        return;
      }
  
      setAppliedCoupon(validateData.data);
      setDiscountAmount(validateData.data.discountAmount);
      setCouponSuccess(`Coupon applied! You saved ₹${validateData.data.discountAmount}`);
      setCouponCode('');
  
      // Recalculate order summary
      setOrderSummary(prev => ({
        ...prev,
        discount: validateData.data.discountAmount,
        total: prev.subtotal + prev.shipping + prev.codFee - validateData.data.discountAmount
      }));
  
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error.message || 'Failed to apply coupon. Please try again.');
    }
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponSuccess('');
    setCouponError('');
    
    // Recalculate order summary without discount
    setOrderSummary(prev => ({
      ...prev,
      discount: 0,
      total: prev.subtotal + prev.shipping + prev.codFee
    }));
  };

  const calculateOrderSummary = () => {
    let subtotal = 0;

    if (cartDetails?.items?.length) {
      subtotal = cartDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } else if (productDetails) {
      subtotal = productDetails.price * productDetails.quantity;
    }

    const shipping = 0;
    const codFee = selectedPayment === 'cod' ? 49 : 0;
    const total = subtotal + shipping + codFee - discountAmount;

    setOrderSummary({
      subtotal,
      shipping,
      discount: discountAmount,
      codFee,
      total
    });
  };

  useEffect(() => {
    calculateOrderSummary();
  }, [selectedPayment]);

  const { initializePayment, isProcessing } = useRazorpay();

  const handleSubmitOrder = async (paymentId = null) => {
    setError(null);
    try {
      if (!selectedAddress) {
        throw new Error('Please select a delivery address');
      }
  
      setIsSubmitting(true);
  
      let orderItems = [];
      if (cartDetails?.items?.length) {
        orderItems = cartDetails.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price
        }));
      } else if (productDetails) {
        orderItems = [{
          productId: productDetails.productId,
          variantId: productDetails.variantId,
          quantity: productDetails.quantity,
          price: productDetails.price
        }];
      }
  
      const orderData = {
        userId: user._id,
        items: orderItems,
        paymentMethod: selectedPayment === 'cod' ? 'cod' : 'online',
        totalAmount: orderSummary.total,
        shippingAddress: {
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName || '',
          address: selectedAddress.address,
          country: selectedAddress.country || 'India',
          state: selectedAddress.state,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
          phoneNumber: selectedAddress.phoneNumber
        },
        couponCode: appliedCoupon?.couponCode,
        discount: discountAmount
      };
  
      if (paymentId) {
        orderData.paymentId = paymentId;
      }
  
      const response = await fetch('http://localhost:3000/user/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
  
      const data = await response.json();

      if (cartDetails?.items?.length) {
        try {
          await fetch(`http://localhost:3000/user/cart/clear/${user._id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        } catch (error) {
          console.error('Failed to clear cart:', error);
        }
      }

      navigate('/user/PaymentSuccess', {
        state: {
          orderId: data.data.orderId,
          orderNumber: data.data.orderNumber
        }
      });

    } catch (error) {
      console.error('Order submission failed:', error);
      setError(error.message || 'Failed to create order');
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setError(null);
    
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }
  
    if (selectedPayment === 'cod') {
      await handleSubmitOrder();
    } else {
      try {
        await initializePayment({
          amount: orderSummary.total,
          user,
          address: selectedAddress,
          onSuccess: async (paymentId) => {
            if (!paymentId) {
              throw new Error('Payment verification failed - no payment ID received');
            }
            await handleSubmitOrder(paymentId);
          },
          onError: (error) => {
            if (error.message === 'Payment cancelled by user') {
              return;
            }
            setError('Payment failed. Please try again.');
            console.error('Payment failed:', error);
          }
        });
      } catch (error) {
        setError('Failed to initialize payment. Please try again.');
        console.error('Payment initialization failed:', error);
      }
    }
  };

  if (!isAuthenticated || !user || (!productDetails && !cartDetails?.items?.length)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 p-6">
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Delivery Section */}
            <div className="mb-8">
              <h2 className="text-base mb-4">Delivery Address</h2>
              <div className="space-y-4">
                {addressesLoading ? (
                  <div className="text-sm text-gray-500">Loading addresses...</div>
                ) : addresses?.map((address) => (
                  <div
                    key={address._id}
                    onClick={() => {
                      setSelectedAddressId(address._id);
                      setSelectedAddress(address);
                    }}
                    className={`p-4 rounded border transition-all cursor-pointer
                      ${selectedAddressId === address._id ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === address._id}
                        onChange={() => {
                          setSelectedAddressId(address._id);
                          setSelectedAddress(address);
                        }}
                        className="mt-1"
                      />
                      <div className="text-sm">
                        <p className="font-medium">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {address.address}, {address.city}
                        </p>
                        <p className="text-gray-600">
                          {address.state} {address.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/user/address')}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  + Add New Address
                </button>
              </div>
            </div>

            {/* Payment Section */}
            <div className="mb-8">
              <h2 className="text-base mb-4">Payment Method</h2>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-4 rounded border transition-all cursor-pointer
                      ${selectedPayment === method.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                      />
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{method.icon}</span>
                          <div className="text-sm">
                            <p className="font-medium">{method.name}</p>
                            <p className="text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        {method.badge && (
                         <span className="text-xs text-gray-500">{method.badge}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5 bg-gray-50 p-6">
            <div className="sticky top-6">
              {/* Cart Items */}
              <div className="mb-6">
                {cartDetails?.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.variant}</p>
                    </div>
                    <div className="text-sm">₹{item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 p-2 border rounded text-sm"
                      />
                      <button
                        onClick={validateAndApplyCoupon}
                        className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-xs">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div>
                      <p className="text-sm font-medium">{appliedCoupon.couponCode}</p>
                      <p className="text-xs text-green-600">{couponSuccess}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-3 text-sm border-t pt-4">
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

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-medium">₹{orderSummary.total.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={handlePaymentSubmit}
                    disabled={isSubmitting || isProcessing}
                    className="w-full py-3 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isProcessing ? 'Processing...' : 'Place Order'}
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