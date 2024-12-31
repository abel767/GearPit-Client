import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  filteredProducts: [],
  categories: [],
  selectedCategories: [],
  expandedCategories: {},
  priceRange: [0, 10000],
  sortBy: 'featured',
  currentPage: 1,
  productsPerPage: 8,
  isFilterOpen: false,
  loading: false,
  error: null
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.filteredProducts = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    toggleCategory: (state, action) => {
      state.expandedCategories = {
        ...state.expandedCategories,
        [action.payload]: !state.expandedCategories[action.payload]
      };
    },
    toggleCategoryFilter: (state, action) => {
      const categoryId = action.payload;
      if (state.selectedCategories.includes(categoryId)) {
        state.selectedCategories = state.selectedCategories.filter(id => id !== categoryId);
      } else {
        state.selectedCategories.push(categoryId);
      }
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilterOpen: (state, action) => {
      state.isFilterOpen = action.payload;
    },
    filterProducts: (state) => {
      let filtered = [...state.products];
      
      // Apply category filter
      if (state.selectedCategories.length > 0) {
        filtered = filtered.filter(product => {
          const productCategoryId = typeof product.category === 'string' 
            ? product.category 
            : product.category?._id;
          return state.selectedCategories.includes(productCategoryId);
        });
      }

      // Apply price range filter
      filtered = filtered.filter(product => {
        const lowestPrice = Math.min(...product.variants.map(v => v.finalPrice));
        return lowestPrice >= state.priceRange[0] && lowestPrice <= state.priceRange[1];
      });

      // Apply sorting
      switch (state.sortBy) {
        case 'price-low-to-high':
          filtered.sort((a, b) => {
            const aPrice = Math.min(...a.variants.map(v => v.finalPrice));
            const bPrice = Math.min(...b.variants.map(v => v.finalPrice));
            return aPrice - bPrice;
          });
          break;
        case 'price-high-to-low':
          filtered.sort((a, b) => {
            const aPrice = Math.min(...a.variants.map(v => v.finalPrice));
            const bPrice = Math.min(...b.variants.map(v => v.finalPrice));
            return bPrice - aPrice;
          });
          break;
        // Add other sorting cases as needed
      }

      state.filteredProducts = filtered;
      state.currentPage = 1;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setProducts,
  setCategories,
  toggleCategory,
  toggleCategoryFilter,
  setPriceRange,
  setSortBy,
  setCurrentPage,
  setFilterOpen,
  filterProducts,
  setLoading,
  setError
} = productSlice.actions;

export default productSlice.reducer;