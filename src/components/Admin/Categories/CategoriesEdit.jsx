import { X, Check } from 'lucide-react';

export default function EditCategory() {
  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Edit Category</h2>
          <div className="flex items-center space-x-2 text-sm mt-1">
            <span className="text-blue-500">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-blue-500">Categories</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">Edit Category</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2">
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md flex items-center gap-2 hover:bg-black/90">
            <Check className="w-4 h-4" />
            Save Category
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column - Thumbnail */}
        <div className="w-[300px] bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-medium mb-2">Thumbnail</h3>
          <div>
            <p className="text-xs text-gray-500 mb-2">Photo</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="relative mb-4">
                <img 
                  src="/placeholder.svg?height=200&width=200" 
                  alt="Category thumbnail" 
                  className="w-full aspect-square object-cover rounded-lg bg-gray-100"
                />
                <button className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">
                  Drag and drop image here, or<br />
                  click change image
                </p>
                <button className="text-green-600 text-sm font-medium">
                  Change Image
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - General Information */}
        <div className="flex-1 bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-medium mb-4">General Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Category Name
              </label>
              <input
                type="text"
                defaultValue="Shipping"
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Description
              </label>
              <textarea
                rows={6}
                defaultValue="Our range of watches are perfect whether you're looking to upgrade."
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}