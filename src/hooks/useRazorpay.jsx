import { useState, useCallback } from 'react';
import { loadRazorpay, createPaymentOrder, createRazorpayOptions } from '../utils/LoadRazorPay';
import { useStockValidation } from './useStockValidation';

export const useRazorpay = () => {

  const [isProcessing, setIsProcessing] = useState(false);
  const {validateStock} = useStockValidation()


  const initializePayment = useCallback(async ({
    amount,
    user,
    address,
    items,
    onSuccess,
    onError
  }) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);

      try {
        await validateStock(items);
      } catch (error) {
        if (error.type === 'STOCK_ERROR') {
          onError({
            code: 'STOCK_ERROR',
            description: error.message,
            metadata: { invalidItems: error.invalidItems }
          });
          return; 
        }
        throw error;
      }

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
            // Enhanced error metadata
            const enhancedError = {
              code: error.code || 'PAYMENT_FAILED',
              description: error.description || error.message || 'Payment failed',
              metadata: {
                order_id: error.metadata?.order_id || orderData.id,
                payment_id: error.metadata?.payment_id
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
        code: error.type === 'STOCK_ERROR'  ? 'STOCK_ERROR' : 'INITIALIZATION_FAILED',
        description: error.message || 'Payment initialization failed',
        metadata: {}
      });
    }
  }, [isProcessing, validateStock]);

  return {
    initializePayment,
    isProcessing
  };
};