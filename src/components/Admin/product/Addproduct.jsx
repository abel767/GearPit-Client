import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import uploadImageToCloudinary from '../../../services/uploadImageToCloudinary';

const AddProduct = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const MAX_IMAGES = 3;

  const [productData, setProductData] = useState({
    productName: '',
    category: '',
    brand: '',
    description: '',
    images: [],
    variants: [
      {
        size: '',
        price: '',
        discount: '0',
        finalPrice: '0',
        stock: ''
      }
    ]
  });

  const [categories, setCategories] = useState([]);

  const calculateFinalPrice = (price, discount) => {
    const numPrice = parseFloat(price) || 0;
    const numDiscount = parseFloat(discount) || 0;
    return numPrice * (1 - numDiscount / 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(
          '/admin/categorydata-addproduct',
          { withCredentials: true }
        );
        console.log('API Response:', response.data);
        setCategories(response.data.activeCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const validateImages = (files) => {
    const newErrors = {};
    
    if (files.length !== MAX_IMAGES) {
      newErrors.images = `Exactly ${MAX_IMAGES} images are required`;
      return newErrors;
    }

    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        newErrors.images = 'Only image files are allowed';
        return newErrors;
      }

      // Check file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        newErrors.images = 'Each image must be less than 5MB';
        return newErrors;
      }
    }

    return newErrors;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const validationErrors = validateImages(files);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setImageFiles(files);
      
      // Preview images
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setImageUrls(previewUrls);
    }
  };

  const handleVariantChange = (index, field, value) => {
    setProductData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: value,
        // Recalculate finalPrice when price or discount changes
        finalPrice: field === 'price' || field === 'discount' 
          ? calculateFinalPrice(
              field === 'price' ? value : newVariants[index].price,
              field === 'discount' ? value : newVariants[index].discount
            )
          : newVariants[index].finalPrice
      };
  
      // Validate size uniqueness
      if (field === 'size') {
        const isDuplicate = newVariants.some(
          (variant, i) => i !== index && variant.size.toLowerCase() === value.toLowerCase()
        );
        if (isDuplicate) {
          toast.error('This size variant already exists');
          return prev;
        }
      }
  
      return {
        ...prev,
        variants: newVariants
      };
    });
  };
  
    


      const addVariant = () => {
        setProductData((prev) => ({
          ...prev,
          variants: [
            ...prev.variants,
            {
              size: '',
              price: '',
              discount: '0',
              finalPrice: '0',
              stock: ''
            }
          ]
        }));
      };

  const removeVariant = (index) => {
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate unique sizes
      const sizes = productData.variants.map(v => v.size.toLowerCase());
      const uniqueSizes = new Set(sizes);
      if (sizes.length !== uniqueSizes.size) {
        toast.error('Each variant must have a unique size');
        return;
      }
  
      if (imageFiles.length !== MAX_IMAGES) {
        toast.error(`Please upload exactly ${MAX_IMAGES} images`);
        return;
      }
  
      // Upload images to Cloudinary
      const uploadedImageUrls = await uploadImageToCloudinary(imageFiles);
      if (!uploadedImageUrls || uploadedImageUrls.length !== MAX_IMAGES) {
        toast.error('Failed to upload images');
        return;
      }
  
      // Convert price and stock to numbers
      const formattedData = {
        ...productData,
        images: uploadedImageUrls,
        variants: productData.variants.map((variant) => ({
          size: variant.size.trim(), // Ensure no whitespace
          price: parseFloat(variant.price),
          discount: parseFloat(variant.discount),
          finalPrice: calculateFinalPrice(variant.price, variant.discount),
          stock: parseInt(variant.stock)
        }))
      };
  
      // Ensure all required fields are filled
      if (!formattedData.variants.every(v => 
        v.size && v.price && v.stock !== undefined && v.stock !== null
      )) {
        toast.error('Please fill all required fields for each variant');
        return;
      }
  
      await axiosInstance.post('/admin/addproduct', formattedData, {
        withCredentials: true,
      });
  
      toast.success('Product added successfully');
      navigate('/admin/productdata');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  
  return (
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Add Product</h2>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-green-500">Dashboard</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-400">Add Product</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/productdata')}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg flex items-center gap-2 hover:bg-black/90"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Form */}
          <div className="flex-1 space-y-6">
            {/* General Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">General Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={productData.productName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={productData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

{/* Variants */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-semibold">Variants</h3>
    <button
      type="button"
      onClick={addVariant}
      className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
    >
      Add Variant
    </button>
  </div>
  <div className="space-y-4">
  {productData.variants.map((variant, index) => (
  <div key={index} className="flex gap-6 items-start border-b pb-6">
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
      <input
        type="text"
        value={variant.size}
        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
    </div>
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
      <input
        type="number"
        value={variant.price}
        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
        required
        min="0"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
    </div>
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Discount (%)
      </label>
      <input
        type="number"
        value={variant.discount}
        onChange={(e) => handleVariantChange(index, 'discount', e.target.value)}
        min="0"
        max="100"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      {variant.price && variant.discount > 0 && (
        <div className="text-sm text-green-600 mt-1">
          Final Price: ₹{calculateFinalPrice(variant.price, variant.discount).toFixed(2)}
        </div>
      )}
    </div>
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
      <input
        type="number"
        value={variant.stock}
        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
        required
        min="0"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
    </div>
    {productData.variants.length > 1 && (
      <button
        type="button"
        onClick={() => removeVariant(index)}
        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
))}
  </div>
</div>


            {/* Media */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Media</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photos (Upload exactly 3 images)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center">
                    <input
                      type="file"
                      multiple
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      required
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="p-3 bg-gray-100 rounded-lg mb-3">
                        <img
                          src="/api/placeholder/24/24"
                          alt="Upload"
                          className="w-6 h-6"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop exactly 3 images here, or click to add
                      </p>
                      <button type="button" className="text-green-500 text-sm font-medium">
                        Add Images
                      </button>
                    </label>
                    {errors.images && (
                      <p className="text-red-500 text-sm mt-2">{errors.images}</p>
                    )}
                    
                    {/* Image Previews */}
                    {imageUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = imageFiles.filter((_, i) => i !== index);
                                const newUrls = imageUrls.filter((_, i) => i !== index);
                                setImageFiles(newFiles);
                                setImageUrls(newUrls);
                                setErrors(validateImages(newFiles));
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 space-y-6">
            {/* Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Category</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category
                </label>
                <select
                  name="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {Array.isArray(categories) ? (
                    categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))
                  ) : (
                    <option value="">No categories available</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
