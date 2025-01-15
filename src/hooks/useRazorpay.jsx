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

      // Configure Razorpay options
      const options = createRazorpayOptions({
        orderData,
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
        user,
        address,
        onSuccess: (paymentId) => {
          setIsProcessing(false);
          onSuccess(paymentId);
        },
        onError: (error) => {
          setIsProcessing(false);
          onError(error);
        }
      });

      // Initialize Razorpay
      const paymentObject = new window.Razorpay(options);
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