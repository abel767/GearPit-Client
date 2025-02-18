import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CreditCard, Wallet, DollarSign, X } from 'lucide-react';
import { fetchAddresses } from '../../redux/Slices/addressSlice';
import { useRazorpay } from '../../hooks/useRazorpay';
import { useWalletPayment } from '../../hooks/walletPaymentHook';
import { fetchWalletDetails } from '../../redux/Slices/walletSlice';
import toast from 'react-hot-toast';
import CouponCard from '../couponTab/CouponCard';
import CartItemsList from './CartListItems';
import { clearCart,clearCartAsync  } from '../../redux/Slices/CartSlice';


import { 
  fetchAvailableCoupons, 
  validateCoupon, 
  clearAppliedCoupon 
} from '../../redux/Slices/CouponSlice';


const UPIIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.36,12l-8.48,8.48L4.4,12l8.48-8.48L21.36,12z M12.88,17.76l4.24-4.24l-4.24-4.24l-4.24,4.24L12.88,17.76z"/>
  </svg>
);



export default function PaymentMethod() {



  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { initializePayment, isProcessing } = useRazorpay();
  const {processWalletPayment,isProcessing: walletProcessing,error: walletError,canPayWithWallet,balance: walletBalance} = useWalletPayment();
  const {availableCoupons,appliedCoupon,loading: isCouponsLoading, error: couponReduxError } = useSelector((state) => state.coupon);

   // Redux selectors
   const cartItems = useSelector((state) => state.cart.items);
   const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
   const user = useSelector((state) => state.user.user);
   const { addresses, loading: addressesLoading, error: addressesError } = useSelector((state) => state.address);

   // Local state
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [error, setError] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    codFee: 0,
    total: 0
  });

 // Route state
 const productDetails = location.state?.productDetails;
 const cartDetails = location.state?.productDetails;
 const isRetry = location.state?.isRetry;
 const retryOrderId = location.state?.productDetails?.orderId;
  

 useEffect(() => {
  // Check the route state to determine if it's a direct purchase or cart checkout
  const isDirectPurchase = location.state?.productDetails?.isDirect;
  
  // Only redirect to cart if:
  // 1. There are no items in cart AND
  // 2. This is not a direct purchase AND
  // 3. We're not in a post-payment state
  if (!cartItems.length && !isDirectPurchase && !location.state?.isPaymentSuccess) {
    navigate('/user/cart');
    return;
  }
}, [location.state, cartItems.length, navigate]);



  useEffect(() => {
  fetchCoupons();
  const savedCouponState = localStorage.getItem('appliedCoupon');
  if (savedCouponState) {
    try {
      const couponData = JSON.parse(savedCouponState);
      dispatch(validateCoupon({
        code: couponData.couponCode,
        cartTotal: orderSummary.subtotal
      }));
    } catch (error) {
      console.error('Error restoring coupon state:', error);
    }
  }
}, []);


useEffect(() => {
  if (!isAuthenticated || !user) {
    navigate('/user/login', { 
      state: { 
        from: location.pathname,
        productDetails: location.state?.productDetails
      },
      replace: true
    });
    return;
  }

  // Prevent navigation to store if we have either cart items or direct purchase details
  const isDirectPurchase = location.state?.productDetails?.isDirect;
  if (!location.state?.productDetails?.items?.length && !cartItems.length && !isDirectPurchase) {
    navigate('/user/store', { replace: true });
    return;
  }

  if (user?._id) {
    dispatch(fetchAddresses(user._id));
  }

  calculateOrderSummary();
}, [isAuthenticated, user, cartItems, navigate, location.pathname, dispatch]);

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0]._id);
      setSelectedAddress(addresses[0]);
    }
  }, [addresses, selectedAddressId]);


  useEffect(() => {
    // When payment method changes to COD, check if order total exceeds limit
    if (selectedPayment === 'cod' && orderSummary.total > 1000) {
      toast.error('Cash on Delivery is not available for orders above ₹1,000');
      setSelectedPayment('card'); // Reset to card payment
    }
  }, [selectedPayment, orderSummary.total]);

  const isPaymentMethodDisabled = (methodId) => {
    if (methodId === 'cod') {
      return orderSummary.total > 1000;
    }
    if (methodId === 'wallet') {
      return !canPayWithWallet(orderSummary?.total || 0);
    }
    return false;
  };

  const getPaymentMethodBadge = (methodId) => {
    if (methodId === 'cod') {
      if (orderSummary.total > 1000) {
        return 'Not available for orders above ₹1,000';
      }
      return '+ ₹49 COD Fee';
    }
    if (methodId === 'wallet' && !canPayWithWallet(orderSummary?.total || 0)) {
      return 'Insufficient Balance';
    }
    return null;
  };

  


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
    description: `Balance: ₹${walletBalance?.toFixed(2) || '0.00'}`,
    disabled: !canPayWithWallet(orderSummary?.total || 0),
    badge: !canPayWithWallet(orderSummary?.total || 0) ? 'Insufficient Balance' : null
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Pay when you receive your order',
      badge: '+ ₹49 COD Fee'
    }
  ];

// Add fetchCoupons function
const fetchCoupons = () => {
  dispatch(fetchAvailableCoupons())
    .unwrap()
    .catch((error) => {
      toast.error('Failed to load available coupons');
    });
};

// Add handleCouponValidation function
const handleCouponValidation = async (code) => {
  setCouponError('');
  setCouponSuccess('');
  
  if (!code?.trim()) {
    setCouponError('Please enter a coupon code');
    return;
  }

  try {
    const result = await dispatch(validateCoupon({
      code,
      cartTotal: orderSummary.subtotal
    })).unwrap();

    // Save coupon state to localStorage
    localStorage.setItem('appliedCoupon', JSON.stringify({
      couponCode: code,
      discountAmount: result.discountAmount
    }));

    setCouponCode('');
    setCouponSuccess(`Coupon applied! You saved ₹${result.discountAmount}`);
    toast.success(`Coupon applied! You saved ₹${result.discountAmount}`);

    setOrderSummary(prev => ({
      ...prev,
      discount: result.discountAmount,
      total: prev.subtotal + prev.shipping + prev.codFee - result.discountAmount
    }));
  } catch (error) {
    setCouponError(error);
    toast.error(error);
  }
};

// Add handleRemoveCoupon function
const handleRemoveCoupon = () => {
  dispatch(clearAppliedCoupon());
  setCouponCode('');
  setCouponSuccess('');
  setCouponError('');
  localStorage.removeItem('appliedCoupon');
  toast.success('Coupon removed');
  
  setOrderSummary(prev => ({
    ...prev,
    discount: 0,
    total: prev.subtotal + prev.shipping + prev.codFee
  }));
};


const calculateOrderSummary = () => {
  let subtotal = 0;
  const isDirectPurchase = location.state?.productDetails?.isDirect;

  if (isDirectPurchase && location.state?.productDetails?.items) {
    // For direct purchase, use the provided subtotal or calculate from items
    subtotal = location.state.productDetails.subtotal || 
      location.state.productDetails.items.reduce((sum, item) => 
        sum + (item.finalPrice * item.quantity), 0);
  } else if (cartItems.length) {
    // For cart checkout
    subtotal = cartItems.reduce((sum, item) => 
      sum + (item.finalPrice * item.quantity), 0);
  }

  const shipping = 0;
  const codFee = selectedPayment === 'cod' ? 49 : 0;
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + shipping + codFee - discount;

  console.log("Direct purchase data:", {
    isDirectPurchase: location.state?.productDetails?.isDirect,
    items: location.state?.productDetails?.items,
    subtotal: location.state?.productDetails?.subtotal
  });

  setOrderSummary({
    subtotal,
    shipping,
    discount,
    codFee,
    total
  });
};


useEffect(() => {
  const isDirectPurchase = location.state?.productDetails?.isDirect;
  
  let subtotal;
  if (isDirectPurchase) {
    subtotal = location.state.productDetails.subtotal;
  } else {
    subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  }

  const shipping = 0;
  const codFee = selectedPayment === 'cod' ? 49 : 0;
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + shipping + codFee - discount;

  setOrderSummary({
    subtotal,
    shipping,
    discount,
    codFee,
    total
  });
}, [location.state?.productDetails, cartItems, selectedPayment, appliedCoupon]);


 const handleSubmitOrder = async (paymentId = null) => {
  setError(null);
  try {
    if (!selectedAddress) {
      throw new Error('Please select a delivery address');
    }

    setIsSubmitting(true);

    // Handle retry payment scenario
    if (isRetry && retryOrderId) {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/orders/${retryOrderId}/retry-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentId,
          paymentMethod: selectedPayment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process retry payment');
      }

      const data = await response.json();
      
      // Clear cart in both Redux and backend for retry payment
      try {
        // First clear the backend cart
        const clearBackendResult = await dispatch(clearCartAsync(user._id)).unwrap();
        console.log('Backend cart cleared:', clearBackendResult);
        
        // Then clear the Redux cart state
        dispatch(clearCart());
        
        // Remove any applied coupon from localStorage
        localStorage.removeItem('appliedCoupon');
        
        toast.success('Payment successful!');
      } catch (error) {
        console.error('Failed to clear cart:', error);
        // Even if backend clear fails, clear the frontend cart
        dispatch(clearCart());
        localStorage.removeItem('appliedCoupon');
      }

      navigate('/user/PaymentSuccess', {
        state: {
          orderId: data.data.orderId,
          orderNumber: data.data.orderNumber,
          isPaymentSuccess: true
        }
      });
      return;
    }

    // Handle new order scenario
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
      discount: appliedCoupon?.discountAmount || 0
    };

    if (paymentId) {
      orderData.paymentId = paymentId;
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/orders`, {
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

    // Clear both Redux cart state and backend cart
    try {
      // First clear the backend cart
      const clearBackendResult = await dispatch(clearCartAsync(user._id)).unwrap();
      console.log('Backend cart cleared:', clearBackendResult);
      
      // Then clear the Redux cart state
      dispatch(clearCart());
      
      // Remove any applied coupon from localStorage
      localStorage.removeItem('appliedCoupon');
      
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      // If backend clear fails, still clear the frontend cart
      dispatch(clearCart());
      localStorage.removeItem('appliedCoupon');
    }

    // Navigate to success page with isPaymentSuccess flag
    navigate('/user/PaymentSuccess', {
      state: {
        orderId: data.data.orderId,
        orderNumber: data.data.orderNumber,
        isPaymentSuccess: true
      }
    });

  } catch (error) {
    console.error('Order submission failed:', error);
    setError(error.message || 'Failed to create order');
    setIsSubmitting(false);
    toast.error(error.message || 'Failed to create order');
  }
};


  


const handlePaymentSubmit = async () => {
  setError(null);
  
  if (!selectedAddress) {
    setError('Please select a delivery address');
    return;
  }

  // Get order items based on whether it's a direct purchase or cart checkout
  const isDirectPurchase = location.state?.productDetails?.isDirect;
  const orderItems = isDirectPurchase 
    ? location.state.productDetails.items
    : cartDetails?.items?.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.finalPrice
      })) || [];

  if (selectedPayment === 'wallet') {
    const paymentAmount = orderSummary.total;
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Invalid payment amount');
      return;
    }

    if (!canPayWithWallet(paymentAmount)) {
      setError('Insufficient wallet balance');
      return;
    }

    try {
      const paymentResult = await processWalletPayment({
        amount: paymentAmount
      });

      if (paymentResult.success) {
        await handleSubmitOrder(paymentResult.data?.transaction?._id);
        dispatch(fetchWalletDetails(user._id));
      } else {
        setError(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      setError('Failed to process wallet payment');
    }
  } else {
    // Prepare order data for Razorpay payment
    const orderData = {
      userId: user._id,
      items: orderItems,
      paymentMethod: 'online',
      totalAmount: orderSummary.total,
      shippingAddress: selectedAddress,
      couponCode: appliedCoupon?.couponCode,
      discount: appliedCoupon?.discountAmount || 0
    };

    console.log("Order Summary:", orderSummary);


    try {
      await initializePayment({
        amount: orderSummary.total,
        user,
        address: selectedAddress,
        items: orderItems,
        onSuccess: async (paymentId) => {
          if (!paymentId) {
            throw new Error('Payment verification failed - no payment ID received');
          }
          await handleSubmitOrder(paymentId);
        },
        onError: async (error) => {
          // Handle stock errors
          if (error.code === 'STOCK_ERROR') {
            const errorMessage = error.description || 'Some items are out of stock';
            toast.error(errorMessage, {
              duration: 3000,
              position: 'top-center'
            });
            setError(errorMessage);
            return;
          }

          console.log('Payment error received:', error);

          // Handle modal close and other payment failures
          try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/payment-failure`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ 
                error,
                orderData
              })
            });

            const failureData = await response.json();
            
            navigate('/user/PaymentFailure', {
              state: {
                errorCode: error.code,
                errorMessage: error.code === 'PAYMENT_MODAL_CLOSED' 
                  ? 'Payment was cancelled.'
                  : error.description || 'Payment failed. Please try again.',
                orderId: failureData.data?.orderId || error.metadata?.order_id,
                isDirectPurchase // Add this flag to handle redirect after failure
              }
            });
          } catch (logError) {
            console.error('Failed to log payment failure:', logError);
            navigate('/user/PaymentFailure', {
              state: {
                errorCode: error.code || 'UNKNOWN_ERROR',
                errorMessage: 'An unexpected error occurred. Please try again.',
                orderId: error.metadata?.order_id,
                isDirectPurchase // Add this flag to handle redirect after failure
              }
            });
          }
        }
      });
    } catch (error) {
      console.error('Payment initialization failed:', error);
      const errorMessage = error.message || 'Failed to initialize payment. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }
};



  if (!isAuthenticated || !user || (!productDetails && !cartDetails?.items?.length)) {
    return null;
  }

  console.log("Location state:", location.state);
console.log("Product details:", productDetails);
console.log("Cart details:", cartDetails);
console.log("Order Summary:", orderSummary);


  
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
              onClick={() => !isPaymentMethodDisabled(method.id) && setSelectedPayment(method.id)}
              className={`p-4 rounded border transition-all ${
                isPaymentMethodDisabled(method.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${selectedPayment === method.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPayment === method.id}
                  onChange={() => !isPaymentMethodDisabled(method.id) && setSelectedPayment(method.id)}
                  disabled={isPaymentMethodDisabled(method.id)}
                />
                <div className="flex items-center justify-between flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{method.icon}</span>
                    <div className="text-sm">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  {getPaymentMethodBadge(method.id) && (
                    <span className="text-xs text-red-500">
                      {getPaymentMethodBadge(method.id)}
                    </span>
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
  <h3 className="text-base mb-4">Order Summary</h3>
  <CartItemsList items={cartDetails?.items} /> 
</div>

              <div className="mb-6">
    <h3 className="text-base mb-3">Available Coupons</h3>
    
    {!appliedCoupon ? (
      <>
        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 p-2 border rounded text-sm"
            />
<button
  onClick={() => handleCouponValidation(couponCode)}
  className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
>
  Apply
</button>
          </div>
          {couponError && (
            <p className="text-red-500 text-xs">{couponError}</p>
          )}
          {couponSuccess && (
            <p className="text-green-500 text-xs">{couponSuccess}</p>
          )}
        </div>

        {isCouponsLoading ? (
          <div className="text-sm text-gray-500">Loading available coupons...</div>
        ) : (
          <div className="space-y-3">
{availableCoupons.map((coupon) => (
  <CouponCard
    key={coupon._id}
    coupon={coupon}
    cartTotal={orderSummary.subtotal}
    onApply={handleCouponValidation}
  />
            ))}
          </div>
        )}
      </>
    ) : (
      <div className="relative">
<CouponCard
  key={appliedCoupon._id}
  coupon={appliedCoupon}
  cartTotal={orderSummary.subtotal}
  onApply={() => {}}
  isApplied={true}
/>
<button
  onClick={handleRemoveCoupon}
  className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
  aria-label="Remove coupon"
>
  <X className="w-4 h-4 text-gray-500" />
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