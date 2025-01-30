export const loadRazorpay = async () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      document.body.removeChild(script);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const createPaymentOrder = async (amount) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ amount: Math.round(amount) })
    });

    if (!response.ok) throw new Error('Payment order creation failed');
    const result = await response.json();
    return {
      id: result.data.orderId,
      amount: result.data.amount,
      currency: result.data.currency
    };
  } catch (error) {
    console.error('Payment order creation error:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/verify-payment`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment verification failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

export const createRazorpayOptions = ({
  orderData,
  keyId,
  user,
  address,
  onSuccess,
  onError
}) => {
  return {
    key: keyId,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    name: 'Your Store Name',
    description: 'Order Payment',
    order_id: orderData.id,
    prefill: {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      contact: address.phoneNumber
    },
    handler: async function (response) {
      try {
        // Verify payment before calling success
        await verifyPayment({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });
        onSuccess(response.razorpay_payment_id);
      } catch (error) {
        onError(error);
      }
    },
    modal: {
      ondismiss: function() {
        onError(new Error('Payment cancelled by user'));
      }
    },
    notes: {
      address: `${address.address}, ${address.city}, ${address.state} ${address.pincode}`
    },
    theme: {
      color: '#000000'
    }
  };
};