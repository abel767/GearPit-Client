import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, AlertTriangle, ArrowLeft, RefreshCcw, Mail } from 'lucide-react';
import { useRazorpayRetry } from '../../hooks/useRazorpayRetry';
// import axiosInstance from '../../api/axiosInstance';

export default function PaymentFailure() {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { initiateRetryPayment, isProcessing } = useRazorpayRetry();
  
  const [errorDetails, setErrorDetails] = useState({
    code: '',
    message: '',
    orderId: '',
    retryWindowEnds: null
  });

  useEffect(() => {
    if (location.state) {
      const retryWindowEnds = location.state.retryWindowEnds 
        ? new Date(location.state.retryWindowEnds)
        : new Date(Date.now() + 1 * 60000); // 1 minute retry window

      setErrorDetails({
        code: location.state.errorCode || '',
        message: location.state.errorMessage || 'Your payment could not be processed.',
        orderId: location.state.orderId || '',
        retryWindowEnds
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (errorDetails.retryWindowEnds) {
      const timer = setInterval(() => {
        const now = new Date();
        const diff = errorDetails.retryWindowEnds - now;
        
        if (diff <= 0) {
          setTimeRemaining(null);
          clearInterval(timer);
          navigate('/user/store');
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining({ minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [errorDetails.retryWindowEnds, navigate]);

  const handleTryAgain = async () => {
    if (!timeRemaining || !errorDetails.orderId) {
      navigate('/user/store');
      return;
    }
  
    setIsRetrying(true);
    try {
      // Get clean order ID
      const cleanOrderId = errorDetails.orderId.replace('order_', '');
      
      await initiateRetryPayment({
        orderId: cleanOrderId,
        onSuccess: () => {
          navigate('/user/PaymentSuccess', {
            state: { message: 'Payment successful!' }
          });
        },
        onError: (error) => {
          // Update error details with new failure
          setErrorDetails(prev => ({
            ...prev,
            code: error.code || 'RETRY_FAILED',
            message: error.message || 'Payment retry failed. Please try again.',
            orderId: error.metadata?.order_id || prev.orderId
          }));
        }
      });
    } catch (error) {
      console.error('Retry payment error:', error);
      setErrorDetails(prev => ({
        ...prev,
        message: 'Unable to process retry payment. Please try again later.'
      }));
    } finally {
      setIsRetrying(false);
    }
  };

  const handleBackToStore = () => {
    navigate('/user/store');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@yourstore.com';
  };

  const isRetryDisabled = !timeRemaining || isProcessing || isRetrying;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse" />
              <div className="relative flex items-center justify-center w-full h-full rounded-full bg-red-500">
                <XCircle className="w-16 h-16 text-white animate-bounce" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-8">{errorDetails.message}</p>

          {timeRemaining && (
            <div className="bg-yellow-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Retry window: {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')} minutes remaining
              </p>
            </div>
          )}

          <div className="bg-red-50 rounded-xl p-6 mb-8">
            <div className="flex flex-col items-center space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-600">Transaction was not completed</span>
              </div>
              {errorDetails.code && (
                <p className="text-gray-600">Error Code: {errorDetails.code}</p>
              )}
              {errorDetails.orderId && (
                <p className="text-gray-600">Order ID: {errorDetails.orderId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleTryAgain}
              disabled={isRetryDisabled}
              className={`flex items-center justify-center px-6 py-3 ${
                !isRetryDisabled
                  ? 'bg-black text-white hover:bg-black/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } rounded-xl transition-colors duration-200`}
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processing...' : 'Try Again'}
            </button>
            
            <button
              onClick={handleBackToStore}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            No amount has been charged
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleContactSupport}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}