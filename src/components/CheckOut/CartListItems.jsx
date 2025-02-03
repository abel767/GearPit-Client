import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

const ProductImage = ({ src, alt }) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no src, show placeholder immediately
  if (!src) {
    return (
      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
        <ImageOff className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
      />
      {(isLoading && !error) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <ImageOff className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  );
};

const CartItemsList = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {items.map((item, index) => {
        // Handle both string ID and populated object cases
        const product = typeof item.productId === 'object' ? item.productId : item;
        
        // If we have variant info directly on the item, use it
        const variant = product.variants?.find(v => v._id?.toString() === item.variantId?.toString());
        
        // Extract and validate data with fallbacks
        const price = variant?.finalPrice || variant?.price || item.price || 0;
        const quantity = item.quantity || 1;
        const name = product.productName || item.name || 'Unnamed Product';
        const size = variant?.size || item.size || '';
        // Default to placeholder if no image
        const image = product.images?.[0] || '/api/placeholder/64/64';
        const stock = variant?.stock ?? item.stock ?? 0;

        return (
          <div 
            key={`${typeof product === 'object' ? product._id : product}-${item.variantId}-${index}`} 
            className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm"
          >
            <div className="relative">
              <ProductImage src={image} alt={name} />
              <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {quantity}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {name}
                  </h4>
                  {size && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                        Size: {size}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900 ml-4">
                  ₹{price.toFixed(2)}
                </div>
              </div>
              
              {stock > 0 && stock < 5 && (
                <p className="text-xs text-orange-600 mt-1">
                  Only {stock} left in stock
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartItemsList;