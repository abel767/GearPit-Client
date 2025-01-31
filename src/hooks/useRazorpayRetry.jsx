import { useState, useCallback } from 'react';
import { loadRazorpay } from '../utils/LoadRazorPay';
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

      // Create new payment order for retry
      const retryResponse = await axiosInstance.post(`/user/orders/${orderId}/retry-payment`);
      
      if (!retryResponse.data.success || !retryResponse.data.data) {
        throw new Error('Failed to create retry payment order');
      }

      const { data: paymentData } = retryResponse.data;

      let paymentTimeout;

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        name: 'GearPit',
        description: `Retry Payment for Order #${paymentData.orderNumber}`,
        handler: async function(response) {
          clearTimeout(paymentTimeout);
          try {
            const verifyResponse = await axiosInstance.post('/user/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId // Original order ID
            });
            
            if (verifyResponse.data.success) {
              setIsProcessing(false);
              onSuccess(verifyResponse.data);
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error) {
            setIsProcessing(false);
            onError({
              code: 'VERIFICATION_FAILED',
              message: error.message || 'Payment verification failed',
              details: error.response?.data
            });
          }
        },
        modal: {
          ondismiss: () => {
            clearTimeout(paymentTimeout);
            setIsProcessing(false);
            onError({
              code: 'MODAL_CLOSED',
              message: 'Payment window was closed'
            });
          }
        },
        retry: {
          enabled: false
        },
        notes: {
          order_id: orderId
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentTimeout = setTimeout(() => {
        paymentObject.close();
        setIsProcessing(false);
        onError({
          code: 'TIMEOUT',
          message: 'Payment timed out'
        });
      }, 300000); // 5 minutes timeout

      paymentObject.open();
      
    } catch (error) {
      setIsProcessing(false);
      onError({
        code: 'INITIALIZATION_FAILED',
        message: error.message || 'Failed to initialize payment retry',
        details: error.response?.data
      });
    }
  }, [isProcessing]);

  return {
    initiateRetryPayment,
    isProcessing
  };
};