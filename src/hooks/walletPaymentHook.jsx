import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { fetchWalletDetails } from '../redux/Slices/walletSlice';

export const useWalletPayment = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    
    const { balance } = useSelector((state) => state.wallet);
    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        // Initial wallet balance fetch
        if (user?._id) {
            dispatch(fetchWalletDetails(user._id));
        }
    }, [user?._id, dispatch]);
  
    const processWalletPayment = async ({ amount }) => {
      setIsProcessing(true);
      setError(null);
  
      try {
        // Validate amount
        const paymentAmount = Number(amount);
        if (!paymentAmount || paymentAmount <= 0) {
            throw new Error('Invalid payment amount');
        }

        // Refresh wallet balance before payment
        const walletResponse = await dispatch(fetchWalletDetails(user._id));
        const currentBalance = walletResponse.payload?.balance || 0;

        // Validate balance
        if (!currentBalance || currentBalance <= 0) {
            throw new Error('No wallet balance available');
        }

        if (!canPayWithWallet(paymentAmount)) {
            throw new Error('Insufficient wallet balance');
        }
  
        const response = await axiosInstance.post('/user/wallet/payment', {
          userId: user._id,
          amount: paymentAmount
        });
  
        if (!response.data.success) {
          throw new Error(response.data.message || 'Payment failed');
        }
  
        // Refresh wallet after payment
        await dispatch(fetchWalletDetails(user._id));
  
        return {
          success: true,
          data: response.data.data
        };
      } catch (err) {
        console.error('Wallet Payment Error:', err);
        setError(err.message || 'Payment failed');
        return {
          success: false,
          error: err.message
        };
      } finally {
        setIsProcessing(false);
      }
    };

    const canPayWithWallet = (amount) => {
        const walletBalance = Number((balance || 0).toFixed(2));
        const paymentAmount = Number(Number(amount).toFixed(2));
        
        // Additional validation
        if (!paymentAmount || paymentAmount <= 0) return false;
        if (!walletBalance || walletBalance <= 0) return false;
        
        return walletBalance >= paymentAmount;
    };

    return {
        processWalletPayment,
        isProcessing,
        error,
        canPayWithWallet,
        balance: Number((balance || 0).toFixed(2))
    };
};