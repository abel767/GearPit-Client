import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, setProducts, setLoading, filterProducts } from '../../redux/Slices/productSlice';
import axiosInstance from '../../api/axiosInstance';
import _ from 'lodash';

const AnimatedSearch = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const dispatch = useDispatch();
  const loading = useSelector(state => state.product.loading);

  // Create a stable debounced search function
  const debouncedSearch = useCallback(
    _.debounce(async (query) => {
      dispatch(setLoading(true));
      try {
        if (!query.trim()) {
          const response = await axiosInstance.get('/admin/productdata');
          const activeProducts = response.data.filter(product => 
            !product.isDeleted && !product.isBlocked
          );
          dispatch(setProducts(activeProducts));
        } else {
          const response = await axiosInstance.get(`/user/search?query=${encodeURIComponent(query)}`);
          if (response.data.success) {
            dispatch(setProducts(response.data.products));
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        dispatch(setLoading(false));
        dispatch(filterProducts());
      }
    }, 500),
    []  // Empty dependency array since we don't want to recreate this function
  );

  // Handle local input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    dispatch(setSearchTerm(value));
    debouncedSearch(value);
  };

  // Clear search
  const clearSearch = () => {
    setLocalSearchTerm('');
    dispatch(setSearchTerm(''));
    debouncedSearch('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="relative flex items-center">
      <div
        className="flex items-center bg-white rounded-full shadow-md h-10"
        style={{
          width: isExpanded ? '256px' : '40px',
          transition: 'width 300ms ease-in-out'
        }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="flex items-center justify-center w-10 h-10 flex-shrink-0"
        >
          <Search 
            className={`w-5 h-5 transition-all duration-300 ${
              loading ? 'text-blue-500' : 'text-gray-500'
            } ${loading ? 'animate-pulse' : ''}`}
          />
        </button>
        
        <input
          type="text"
          placeholder="Search products..."
          value={localSearchTerm}
          onChange={handleSearch}
          style={{
            width: isExpanded ? '176px' : '0',
            padding: isExpanded ? '0 8px' : '0',
            opacity: isExpanded ? '1' : '0',
            transition: 'all 300ms ease-in-out'
          }}
          className="bg-transparent outline-none text-gray-700 text-sm"
        />
        
        {localSearchTerm && isExpanded && (
          <button
            type="button"
            onClick={clearSearch}
            className="flex items-center justify-center w-10 h-10 flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimatedSearch;