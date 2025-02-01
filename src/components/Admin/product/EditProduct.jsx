import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import uploadImageToCloudinary from '../../../services/uploadImageToCloudinary'; // Assuming you have this utility
import ImageUploader from './ImageUploader';
const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/admin/productdata`, {
          withCredentials: true
        });
        const product = response.data.find(p => p._id === id);

        if (product) {
          setProductData({
            productName: product.productName,
            category: product.category._id || product.category,
            brand: product.brand || '',
            description: product.description || '',
            images: product.images || [],
            variants: product.variants.map(variant => ({
              size: variant.size,
              price: variant.price.toString(),
              discount: variant.discount?.toString() || '0',
              finalPrice: variant.finalPrice.toString(),
              stock: variant.stock.toString()
            }))
          });

          // Set product images in the format expected by ImageUploader
          setProductImages(
            (product.images || []).map(url => ({
              preview: url,
              file: url
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product data');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(
          '/admin/categorydata-addproduct',
          { withCredentials: true }
        );
        setCategories(response.data.activeCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

  const calculateFinalPrice = (price, discount) => {
    const numPrice = parseFloat(price) || 0;
    const numDiscount = parseFloat(discount) || 0;
    return numPrice * (1 - numDiscount / 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setProductData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: value,
        finalPrice: field === 'price' || field === 'discount'
          ? calculateFinalPrice(
              field === 'price' ? value : newVariants[index].price,
              field === 'discount' ? value : newVariants[index].discount
            ).toString()
          : newVariants[index].finalPrice
      };
      return {
        ...prev,
        variants: newVariants
      };
    });
  };

  const addVariant = () => {
    setProductData(prev => ({
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
    if (productData.variants.length > 1) {
      setProductData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validate that we have at least one image
      if (!productImages || productImages.length === 0) {
        toast.error('Please add at least one product image');
        setIsSubmitting(false);
        return;
      }

      // Create an array to store all image URLs (both existing and new)
      let finalImageUrls = [];

      // Process each image
      for (const img of productImages) {
        if (typeof img.file === 'string') {
          // This is an existing image URL
          finalImageUrls.push(img.file);
        } else if (img.file instanceof File || img.file instanceof Blob) {
          // This is a new image that needs to be uploaded
          try {
            const uploadedUrls = await uploadImageToCloudinary([img.file]);
            if (uploadedUrls && uploadedUrls.length > 0) {
              finalImageUrls.push(uploadedUrls[0]);
            }
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            toast.error('Failed to upload one or more images');
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Validate that we have successfully processed at least one image
      if (finalImageUrls.length === 0) {
        toast.error('No valid images found. Please add at least one image.');
        setIsSubmitting(false);
        return;
      }

      const formattedData = {
        ...productData,
        images: finalImageUrls,
        variants: productData.variants.map((variant) => ({
          size: variant.size.trim(),
          price: parseFloat(variant.price),
          discount: parseFloat(variant.discount || 0),
          finalPrice: calculateFinalPrice(variant.price, variant.discount || 0),
          stock: parseInt(variant.stock)
        }))
      };

      await axiosInstance.put(
        `/admin/editproduct/${id}`,
        formattedData,
        { withCredentials: true }
      );

      toast.success('Product updated successfully');
      navigate('/admin/productdata');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
      setIsSubmitting(false);
    }
  };


  return (
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Edit Product</h2>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-blue-500">Dashboard</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-400">Edit Product</span>
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
              <Check className="w-4 h-4" />
              Save Changes
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
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Media</h3>
                <ImageUploader
                  images={productImages}
                  onImagesChange={setProductImages}
                  showCrop={true}
                />
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
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;