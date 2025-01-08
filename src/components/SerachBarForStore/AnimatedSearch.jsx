import  { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, filterProducts } from '../../redux/Slices/productSlice';

const AnimatedSearch = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const searchTerm = useSelector(state => state.product.searchTerm);

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
    dispatch(filterProducts());
  };

  const clearSearch = () => {
    dispatch(setSearchTerm(''));
    dispatch(filterProducts());
  };

  return (
    <div className="relative flex items-center">
      <div
        className={`
          flex items-center
          bg-white rounded-full
          shadow-md
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-10'}
          h-10
        `}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-10 h-10"
        >
          <Search 
            className={`
              w-5 h-5 text-gray-500
              transition-transform duration-300
              ${isExpanded ? 'scale-90' : 'scale-100'}
            `}
          />
        </button>
        
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className={`
            bg-transparent outline-none
            text-gray-700 text-sm
            transition-all duration-300
            ${isExpanded ? 'w-44 opacity-100' : 'w-0 opacity-0'}
          `}
        />
        
        {searchTerm && isExpanded && (
          <button
            onClick={clearSearch}
            className="flex items-center justify-center w-10 h-10"
          >
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimatedSearch;