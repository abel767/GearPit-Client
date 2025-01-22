import { useState, useCallback } from 'react';
import { loadRazorpay } from '../utils/LoadRazorPay;
import axiosInstance from '../api/axiosInstance';

export const useRazorpayRetry = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiateRetryPayment = useCallback(async ({
    orderId,
    onSuccess,
    onError
  }) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);

      // Load Razorpay SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Get new payment order for retry
      const response = await axiosInstance.post(`/orders/${orderId}/retry-payment`);
      const { data: paymentData } = response;

      if (!paymentData || !paymentData.data.orderId) {
        throw new Error('Invalid retry payment response');
      }

      let paymentTimeout;

      const options = {
        key: paymentData.data.key,
        amount: paymentData.data.amount,
        currency: paymentData.data.currency,
        order_id: paymentData.data.orderId,
        name: 'Your Store Name',
        description: `Retry Payment for Order #${paymentData.data.orderNumber}`,
        handler: async function(response) {
          clearTimeout(paymentTimeout);
          try {
            // Verify the payment
            await axiosInstance.post(`/orders/${orderId}/verify-retry-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId
            });
            
            setIsProcessing(false);
            onSuccess();
          } catch (error) {
            setIsProcessing(false);
            onError(error);
          }
        },
        modal: {
          ondismiss: () => {
            clearTimeout(paymentTimeout);
            setIsProcessing(false);
            onError(new Error('Payment cancelled'));
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      // Set timeout for payment completion
      paymentTimeout = setTimeout(() => {
        paymentObject.close();
        setIsProcessing(false);
        onError(new Error('Payment timeout'));
      }, 300000); // 5 minutes timeout for retry

      paymentObject.open();
      
    } catch (error) {
      setIsProcessing(false);
      onError(error);
    }
  }, [isProcessing]);

  return {
    initiateRetryPayment,
    isProcessing
  };
};