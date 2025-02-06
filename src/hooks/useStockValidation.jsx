// hooks/useStockValidation.js
import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

export const useStockValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateStock = async (items) => {
    try {
      setIsValidating(true);
      const response = await axiosInstance.post('/user/validate-stock', { items });
      
      if (!response.data.valid) {
        const invalidItems = response.data.invalidItems;
        const errorMessages = invalidItems
          .map(item => item.message)
          .join(', ');
          
        throw {
          type: 'STOCK_ERROR',
          invalidItems,
          message: errorMessages // Now includes the actual error messages
        };
      }
      return response.data;
    } catch (error) {
        if (error.type === 'STOCK_ERROR') {
            throw error;
          }
          throw {
            type: 'STOCK_ERROR',
            message: error.response?.data?.message || 'Failed to validate stock'
          };
        } finally {
          setIsValidating(false);
        }
      };

  return { validateStock, isValidating };
};