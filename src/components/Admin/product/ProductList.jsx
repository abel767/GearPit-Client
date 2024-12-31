import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Eye, Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Products");
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/admin/editproduct/${id}`);
  };
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:3000/admin/productdata", {
          credentials: 'include'
        });
        const data = await response.json();
        console.log("Products data received:", data);
        setAllProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [allProducts, activeFilter, selectedDate]);

  const filterProducts = () => {
    let filtered = [...allProducts];

    if (activeFilter === "Low Stock") {
      filtered = filtered.filter((product) =>
        product.variants.some((variant) => variant.stock <= 5 && variant.stock > 0)
      );
    } else if (activeFilter === "Out of Stock") {
      filtered = filtered.filter((product) =>
        product.variants.every((variant) => variant.stock === 0)
      );
    } else if (activeFilter === "Published") {
      filtered = filtered.filter((product) => !product.isDeleted);
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (product) =>
          new Date(product.createdAt).toDateString() ===
          new Date(selectedDate).toDateString()
      );
    }

    setProducts(filtered);
  };

  
  const handleDelete = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/softdeleteproduct/${productId}`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      );
      if (response.ok) {
        setAllProducts(allProducts.map((p) => 
          p._id === productId ? { ...p, isDeleted: true } : p
        ));
        toast.success("Product deleted successfully");
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const calculateStock = (variants) =>
    variants.reduce((total, variant) => total + (variant.stock || 0), 0);

  const getLowestPrice = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((lowest, current) => 
      (current.price < lowest.price) ? current : lowest
    , variants[0]).price;
  };

  const getHighestDiscount = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((highest, current) => 
      (current.discount > highest) ? current.discount : highest
    , 0);
  };
  
  const getLowestFinalPrice = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((lowest, current) => {
      const currentFinalPrice = current.finalPrice || current.price * (1 - (current.discount || 0) / 100);
      const lowestPrice = lowest.finalPrice || lowest.price * (1 - (lowest.discount || 0) / 100);
      return currentFinalPrice < lowestPrice ? current : lowest;
    }, variants[0]).finalPrice;
  };

  const getCategoryName = (category) => {
    if (!category) return "N/A";
    return typeof category === 'string' ? category : category.categoryName || "N/A";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <button 
          onClick={() => navigate('/admin/addproduct')} 
          className="px-4 py-2 text-sm font-medium bg-black text-white border border-gray-300 rounded-lg"
        >
          + Add Product
        </button>
      </div>

      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          {["All Products", "Published", "Low Stock", "Out of Stock"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg ${
                activeFilter === filter
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Base Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Discount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Final Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Added</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.productName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-900">{product.productName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{getCategoryName(product.category)}</td>
                <td className="px-4 py-3">{calculateStock(product.variants)}</td>
                <td className="px-4 py-3">₹{getLowestPrice(product.variants)}</td>
                <td className="px-4 py-3">
                  {getHighestDiscount(product.variants)}%
                </td>
                <td className="px-4 py-3">₹{getLowestFinalPrice(product.variants)}</td>
                <td className="px-4 py-3">
                  {product.createdAt ? format(new Date(product.createdAt), "dd MMM yyyy") : "N/A"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-gray-100 rounded-lg">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleEdit(product._id)} className="p-2 bg-gray-100 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 bg-gray-100 rounded-lg text-red-600"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;