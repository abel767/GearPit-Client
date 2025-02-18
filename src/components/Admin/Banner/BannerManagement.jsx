import  { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import uploadImageToCloudinary from '../../../services/uploadImageToCloudinary';
import axiosInstance from '../../../api/axiosInstance';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    link: '',
    displayOrder: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axiosInstance.get('/admin/banners');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const urls = await uploadImageToCloudinary(files);
      setFormData(prev => ({ ...prev, imageUrl: urls[0] }));
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedBanner) {
        await axiosInstance.put(`/admin/banners/${selectedBanner._id}`, formData);
      } else {
        await axiosInstance.post('/admin/banners', formData);
      }
      setIsModalOpen(false);
      setSelectedBanner(null);
      setFormData({ title: '', imageUrl: '', link: '', displayOrder: 0 });
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Banner Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner._id} className="border rounded-lg overflow-hidden shadow-md">
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{banner.title}</h3>
              <p className="text-sm text-gray-600 mb-4">Order: {banner.displayOrder}</p>
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setSelectedBanner(banner);
                    setFormData(banner);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this banner?')) {
                      await axiosInstance.delete(`/admin/banners/${banner._id}`);
                      fetchBanners();
                    }
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {selectedBanner ? 'Edit Banner' : 'Add New Banner'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="w-full"
                  accept="image/*"
                  required={!selectedBanner}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link (Optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedBanner(null);
                    setFormData({ title: '', imageUrl: '', link: '', displayOrder: 0 });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedBanner ? 'Update' : 'Add'} Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;