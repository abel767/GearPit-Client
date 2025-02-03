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
    if (!cartItems.length) {
      navigate('/user/cart');
      return;
    }
  }, [cartItems, navigate]);

// Replace the old useEffect
useEffect(() => {
  fetchCoupons();
}, []);
  
  useEffect(() => {
    if (!cartItems.length) {
      navigate('/user/cart');
      return;
    }
  }, [cartItems, navigate]);

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
  toast.success('Coupon removed');
  
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
    const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const shipping = 0;
    const codFee = selectedPayment === 'cod' ? 49 : 0;
    const total = subtotal + shipping + codFee - orderSummary.discount;

    setOrderSummary({
      subtotal,
      shipping,
      discount: orderSummary.discount,
      codFee,
      total
    });
  }, [cartItems, selectedPayment, orderSummary.discount]);


  const handleSubmitOrder = async (paymentId = null) => {
    setError(null);
    try {
      if (!selectedAddress) {
        throw new Error('Please select a delivery address');
      }
  
      setIsSubmitting(true);

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
        navigate('/user/PaymentSuccess', {
          state: {
            orderId: data.data.orderId,
            orderNumber: data.data.orderNumber
          }
        });
        return;
      }
  
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

      if (cartDetails?.items?.length) {
        try {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/cart/clear/${user._id}`, {
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
  
    if (selectedPayment === 'wallet') {
      const paymentAmount = orderSummary.total;
      
      // Validate amount
      if (!paymentAmount || paymentAmount <= 0) {
        setError('Invalid payment amount');
        return;
      }
  
      // Validate wallet balance
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
    }else {

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
          onError: async (error) => {
            // Don't handle user cancellation as a failure
            if (error.message === 'Payment cancelled by user') {
              return;
            }
  
            // Send failure details to backend
            try {
              await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/payment-failure`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  error: {
                    code: error.code,
                    description: error.description,
                    source: error.source,
                    step: error.step,
                    reason: error.reason,
                    metadata: {
                      order_id: error.metadata?.order_id,
                      payment_id: error.metadata?.payment_id
                    }
                  }
                })
              });
            } catch (logError) {
              console.error('Failed to log payment failure:', logError);
            }
  
            // Navigate to failure page with error details
            navigate('/user/PaymentFailure', {
              state: {
                errorCode: error.code,
                errorMessage: error.description || 'Payment failed. Please try again.',
                orderId: error.metadata?.order_id
              }
            });
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