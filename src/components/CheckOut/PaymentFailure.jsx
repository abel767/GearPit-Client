import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, AlertTriangle, ArrowLeft, RefreshCcw, Mail } from 'lucide-react';

export default function PaymentFailure() {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(null);
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
        : new Date(Date.now() + 11 * 60000); // Default 11 minutes

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
          // Optionally redirect to store or clear order
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

  const handleTryAgain = () => {
    if (!timeRemaining) {
      // If retry window expired, redirect to store
      navigate('/user/store');
      return;
    }
    navigate('/user/Checkout');
  };

  const handleBackToStore = () => {
    navigate('/user/store');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@yourstore.com';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse" />
              <div className="relative flex items-center justify-center w-full h-full rounded-full bg-red-500">
                <XCircle className="w-16 h-16 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            {errorDetails.message}
          </p>

          {/* Retry Timer */}
          {timeRemaining && (
            <div className="bg-yellow-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Retry window: {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')} minutes remaining
              </p>
            </div>
          )}

          {/* Error Details */}
          <div className="bg-red-50 rounded-xl p-6 mb-8">
            <div className="flex flex-col items-center space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-600">
                  Transaction was not completed
                </span>
              </div>
              {errorDetails.code && (
                <p className="text-gray-600">Error Code: {errorDetails.code}</p>
              )}
              {errorDetails.orderId && (
                <p className="text-gray-600">Order ID: {errorDetails.orderId}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleTryAgain}
              disabled={!timeRemaining}
              className={`flex items-center justify-center px-6 py-3 ${
                timeRemaining 
                  ? 'bg-black text-white hover:bg-black/90' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } rounded-xl transition-colors duration-200`}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
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

        {/* Support Section */}
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


