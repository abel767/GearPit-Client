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
        throw new Error('Razorpay SDK failed to load');
      }

      // Create payment order
      const orderData = await createPaymentOrder(amount);
      if (!orderData || !orderData.id) {
        throw new Error('Invalid payment order response');
      }

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
            // Ensure error has proper metadata
            const enhancedError = {
              ...error,
              metadata: {
                ...error.metadata,
                order_id: error.metadata?.order_id || orderData.id
              }
            };
            onError(enhancedError);
          }
        }),
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

      const paymentObject = new window.Razorpay(options);
      
      // Set payment timeout
      paymentTimeout = setTimeout(() => {
        paymentObject.close();
        setIsProcessing(false);
        onError({
          code: 'PAYMENT_TIMEOUT',
          description: 'Payment timed out',
          metadata: {
            order_id: orderData.id
          }
        });
      }, 300000); // 5 minutes timeout

      paymentObject.open();
      
    } catch (error) {
      setIsProcessing(false);
      onError({
        code: 'INITIALIZATION_FAILED',
        description: error.message || 'Payment initialization failed',
        metadata: {}
      });
    }
  }, [isProcessing]);

  return {
    initializePayment,
    isProcessing
  };
};