import { useState, useEffect } from 'react';
import { Heart, ChevronDown, ChevronRight, MinusIcon } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const sortOptions = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'Price: Low to High', value: 'price-low-to-high' },
  { label: 'Price: High to Low', value: 'price-high-to-low' },
  { label: 'Average Ratings', value: 'average-ratings' },
  { label: 'Featured', value: 'featured' },
  { label: 'New Arrivals', value: 'new-arrivals' },
  { label: 'A - Z', value: 'a-to-z' },
  { label: 'Z - A', value: 'z-to-a' },
];

export default function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const productsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:3000/admin/productdata'),
          axios.get('http://localhost:3000/admin/categorydata-addproduct'),
        ]);

        const activeProducts = productsRes.data.filter(
          (product) => !product.isDeleted
        );
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
        setCategories(categoriesRes.data.activeCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleCategoryFilter = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = Number(value);
    setPriceRange(newRange);
  };

  const getPriceDetails = (variants) => {
    if (!variants || variants.length === 0)
      return { originalPrice: 0, finalPrice: 0, discount: 0 };

    const lowestPriceVariant = variants.reduce((lowest, current) => {
      const currentFinalPrice =
        current.finalPrice ||
        current.price * (1 - (current.discount || 0) / 100);
      const lowestFinalPrice =
        lowest.finalPrice ||
        lowest.price * (1 - (lowest.discount || 0) / 100);
      return currentFinalPrice < lowestFinalPrice ? current : lowest;
    }, variants[0]);

    return {
      originalPrice: lowestPriceVariant.price,
      finalPrice: lowestPriceVariant.finalPrice,
      discount: lowestPriceVariant.discount,
    };
  };

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        const productCategoryId =
          typeof product.category === 'string'
            ? product.category
            : product.category?._id;

        return selectedCategories.includes(productCategoryId);
      });
    }

    // Apply price range filter
    filtered = filtered.filter((product) => {
      const lowestPrice = Math.min(
        ...product.variants.map((v) => v.finalPrice)
      );
      return lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
    });

    // Apply sorting
    switch (sortBy) {
      case 'price-low-to-high':
        filtered.sort((a, b) => {
          const aPrice = Math.min(...a.variants.map((v) => v.finalPrice));
          const bPrice = Math.min(...b.variants.map((v) => v.finalPrice));
          return aPrice - bPrice;
        });
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [selectedCategories, priceRange, sortBy, products]);

  const getLowestPrice = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.finalPrice));
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Discover Top-Quality Riding Gear for Every Adventure
      </h1>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">Filters</h3>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category._id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => toggleCategoryFilter(category._id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{category.categoryName}</span>
                      </label>
                      {category.subcategories?.length > 0 && (
                        <button
                          onClick={() => toggleCategory(category._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedCategories[category._id] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {expandedCategories[category._id] &&
                      category.subcategories?.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {category.subcategories.map((sub) => (
                            <label
                              key={sub._id}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(sub._id)}
                                onChange={() => toggleCategoryFilter(sub._id)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{sub.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-4">Price Range</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Min"
                  />
                  <MinusIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Max"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setPriceRange([0, 10000])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Reset Price
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort Dropdown */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <button
                className="flex items-center justify-between w-64 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
                <ChevronDown className="w-5 h-5 ml-2" />
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setSortBy(option.value);
                          setIsFilterOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentProducts.map((product) => (
              <div
                key={product._id}
                className="group relative bg-white p-2 rounded-lg shadow"
              >
                <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-1">
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
                <div className="relative aspect-square mb-3">
                  <img
                    src={product.images[0]}
                    alt={product.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-2 line-clamp-2 h-10">
                    {product.productName}
                  </h3>
                  <div className="mb-2 flex flex-col items-center">
                    {(() => {
                      const { originalPrice, finalPrice, discount } =
                        getPriceDetails(product.variants);
                      return (
                        <>
                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{finalPrice.toFixed(2)}
                            </span>
                            {discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {discount > 0 && (
                            <span className="text-sm text-green-600">
                              {discount}% off
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-4 text-sm rounded">
                      Add to Cart
                    </button>
                    <button className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-4 text-sm rounded">
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-1 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${
                    page === currentPage
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  } border border-gray-300 rounded`}
                >
                  {page}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
