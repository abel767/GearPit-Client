export const validateOrderQuantities = async (items) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/validate-quantities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ items })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate quantities');
      }
  
      return {
        isValid: data.success,
        invalidItems: data.invalidItems || [],
        message: data.message
      };
    } catch (error) {
      console.error('Quantity validation error:', error);
      throw error;
    }
  };