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
    
    if (!result.success || !result.data) {
      throw new Error('Invalid payment order response');
    }

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
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Payment verification failed');
    }
    
    return result;
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
    name: 'GearPit',
    description: 'Order Payment',
    order_id: orderData.id,
    prefill: {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      contact: address.phoneNumber
    },
    handler: async function (response) {
      try {
        // Verify payment with all required fields
        const verifyResponse = await verifyPayment({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });

        if (verifyResponse.success) {
          onSuccess(response.razorpay_payment_id);
        } else {
          throw new Error(verifyResponse.message || 'Payment verification failed');
        }
      } catch (error) {
        onError({
          code: 'VERIFICATION_FAILED',
          description: error.message,
          metadata: {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id
          }
        });
      }
    },
    modal: {
      ondismiss: function() {
        onError({
          code: 'PAYMENT_MODAL_CLOSED',
          description: 'Payment window was closed before completion',
          metadata: {
            order_id: orderData.id
          }
        });
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