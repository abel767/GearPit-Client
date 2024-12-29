import { X, Check } from 'lucide-react';

export default function EditProduct() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Edit Product</h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-blue-500">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-blue-500">Product List</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">Edit Product</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2">
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg flex items-center gap-2 hover:bg-black/90">
            <Check className="w-4 h-4" />
            Save Product
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
                  defaultValue="Samsung Galaxy S24"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  defaultValue="Ipsum..........."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Media</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="relative bg-gray-100 rounded-lg aspect-square">
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center justify-center pt-4 border-t border-dashed border-gray-300">
                  <p className="text-sm text-gray-500 mb-1">
                    Drag and drop image here, or click add image
                  </p>
                  <button className="text-green-500 text-sm font-medium">
                    Add Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing and Offer Setting */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Pricing And Offer Setting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="text"
                    defaultValue="400.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="text"
                    defaultValue="0%"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                defaultValue="124"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          {/* Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a category</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
