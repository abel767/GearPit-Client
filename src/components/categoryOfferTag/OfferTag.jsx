import { Tag } from 'lucide-react';

const OfferTag = ({ product, category }) => {
  const hasProductOffer = product?.offer?.isActive && product?.offer?.percentage > 0;
  const hasCategoryOffer = category?.offer?.isActive && category?.offer?.percentage > 0;

  if (!hasProductOffer && !hasCategoryOffer) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
      {/* Product Offer */}
      {hasProductOffer && (
        <>
          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-md">
            <Tag className="w-4 h-4" />
            <span className="text-xs font-semibold">
              {product.offer.percentage}% OFF
            </span>
          </div>
          <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded-md shadow-sm">
            Ends {formatDate(product.offer.endDate)}
          </div>
        </>
      )}

      {/* Category Offer */}
      {hasCategoryOffer && (
        <>
          <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-md">
            <Tag className="w-4 h-4" />
            <span className="text-xs font-semibold">
              Category {category.offer.percentage}% OFF
            </span>
          </div>
          <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded-md shadow-sm">
            Ends {formatDate(category.offer.endDate)}
          </div>
        </>
      )}
    </div>
  );
};

export default OfferTag;