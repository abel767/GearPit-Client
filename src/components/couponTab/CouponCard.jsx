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
      className={`group relative bg-gray-900 rounded-lg overflow-hidden transition-all ${
        isValid ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-not-allowed opacity-75'
      } ${className}`}
      onClick={() => isValid && onApply(coupon.code)}
    >
      {/* Decorative gradient border */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-400 to-green-600" />
      
      {/* Zigzag pattern overlay */}
      <div className="absolute top-0 right-0 w-32 h-full opacity-5">
        <div className="w-full h-full relative">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 transform"
              style={{
                border: '2px dashed rgba(255,255,255,0.2)',
                margin: `${i * 8}px`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scissors className="w-4 h-4 text-green-400" />
              <span className="font-bold text-lg tracking-wide text-white">{coupon.code}</span>
            </div>
            <p className="text-sm text-green-400 font-medium">
              Save {coupon.discount}% on your order
            </p>
          </div>
          <div className="flex items-start gap-2">
            <button
              onClick={copyCode}
              className="p-1.5 hover:bg-gray-800 rounded-full transition-colors"
              title="Copy code"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
            <div className="text-2xl font-bold text-yellow-500">
              {coupon.discount}%
              <span className="block text-xs text-yellow-400 text-right">OFF</span>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Valid Till: {formatDate(coupon.expiryDate)}</span>
            {isValid && (
              <span className="text-xs text-green-400 font-medium">
                You Save: ₹{savings.toFixed(2)}
              </span>
            )}
          </div>

          {!isValid ? (
            <p className="text-xs text-red-400 text-center">
              Add ₹{(coupon.minPurchase - cartTotal).toFixed(2)} more to unlock
            </p>
          ) : isApplied ? (
            <div className="text-center py-1.5 bg-green-500 text-white text-sm font-medium rounded">
              Applied
            </div>
          ) : (
            <div className="text-center py-1.5 bg-green-500 text-white text-sm font-medium rounded opacity-90 group-hover:opacity-100 transition-all">
              Apply Coupon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;