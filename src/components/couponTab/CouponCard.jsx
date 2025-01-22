import { Scissors, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const CouponCard = ({ 
  coupon, 
  cartTotal, 
  onApply, 
  isApplied = false,
  className = ''
}) => {
  const isValid = cartTotal >= coupon.minPurchase;
  const savings = Math.min((cartTotal * coupon.discount) / 100, coupon.maxDiscount);
  
  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    toast.success('Coupon code copied!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`group relative bg-white rounded-lg border hover:border-blue-200 transition-all ${
        isValid ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
      } ${className}`}
      onClick={() => isValid && onApply(coupon.code)}
    >
      {/* Decorative edges */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-gray-50 rounded-r-full" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-gray-50 rounded-l-full" />
      
      {/* Dotted line */}
      <div className="absolute left-3 right-3 top-1/2 border-t border-dashed border-gray-200" />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scissors className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-lg tracking-wide">{coupon.code}</span>
            </div>
            <p className="text-sm text-blue-600 font-semibold">
              Save {coupon.discount}% on your order
            </p>
          </div>
          <button
            onClick={copyCode}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Min. Purchase:</span>
            <span className="font-medium">₹{coupon.minPurchase}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Max. Discount:</span>
            <span className="font-medium">₹{coupon.maxDiscount}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Valid Till:</span>
            <span className="font-medium">{formatDate(coupon.expiryDate)}</span>
          </div>
          {isValid && (
            <div className="flex items-center justify-between text-xs text-green-600">
              <span>You Save:</span>
              <span className="font-medium">₹{savings.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        {/* Action */}
        {!isValid ? (
          <p className="text-xs text-red-500 text-center">
            Add ₹{(coupon.minPurchase - cartTotal).toFixed(2)} more to unlock
          </p>
        ) : isApplied ? (
          <div className="text-center py-1.5 bg-green-50 text-green-600 text-sm font-medium rounded">
            Applied
          </div>
        ) : (
          <div className="text-center py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded group-hover:bg-blue-100 transition-colors">
            Apply Coupon
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponCard;