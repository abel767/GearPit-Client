import { useState, useCallback } from 'react';
import { loadRazorpay, createPaymentOrder, createRazorpayOptions } from '../utils/LoadRazorPay';

export const useRazorpay = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const initializePayment = useCallback(async ({
    amount,
    user,
    address,
    onSuccess,
    onError
  }) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);

      // Load Razorpay SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Create payment order
      const orderData = await createPaymentOrder(amount);
      if (!orderData || !orderData.id) {
        throw new Error('Invalid payment order response');
      }

      // Set up payment timeout
      let paymentTimeout;
      
      const options = {
        ...createRazorpayOptions({
          orderData,
          keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
          user,
          address,
          onSuccess: (paymentId) => {
            clearTimeout(paymentTimeout);
            setIsProcessing(false);
            onSuccess(paymentId);
          },
          onError: (error) => {
            clearTimeout(paymentTimeout);
            setIsProcessing(false);
            onError(error);
          }
        }),
        // Add modal closing handler
        modal: {
          ondismiss: () => {
            clearTimeout(paymentTimeout);
            setIsProcessing(false);
            onError({
              code: 'PAYMENT_MODAL_CLOSED',
              description: 'Payment window was closed before completion',
              metadata: {
                order_id: orderData.id
              }
            });
          }
        }
      };

      // Initialize Razorpay
      const paymentObject = new window.Razorpay(options);
      
      // Set timeout for payment completion
      paymentTimeout = setTimeout(() => {
        paymentObject.close();
        setIsProcessing(false);
        onError({
          code: 'PAYMENT_TIMEOUT',
          description: 'Payment was not completed within the time limit',
          metadata: {
            order_id: orderData.id
          }
        });
      }, 50000); // 50 seconds timeout

      paymentObject.open();
      
    } catch (error) {
      setIsProcessing(false);
      onError(new Error(`Payment initialization failed: ${error.message}`));
    }
  }, [isProcessing]);

  return {
    initializePayment,
    isProcessing
  };
};