import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Calendar, Plus, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../../api/axiosInstance';
function OfferManagement() {
  const navigate = useNavigate();
  const [productOffers, setProductOffers] = useState([]);
  const [categoryOffers, setCategoryOffers] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    setPortalContainer(div);
    return () => document.body.removeChild(div);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && !event.target.closest('.menu-trigger')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeMenu]);

  const fetchOffers = async () => {
    try {
      const response = await axiosInstance.get('/admin/offers');
      const { productOffers = [], categoryOffers = [] } = response.data;
      setProductOffers(productOffers);
      setCategoryOffers(categoryOffers);
      setError(null);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, type, currentStatus) => {
    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/admin/${type === 'product' ? 'product-offer' : 'category-offer'}/${id}`;
      await axios.patch(endpoint, {
        isActive: !currentStatus
      });
      await fetchOffers();
      setActiveMenu(null);
    } catch (error) {
      console.error('Error updating offer status:', error);
      setError('Failed to update offer status');
    }
  };

  const handleDelete = async (id, type) => {
    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/admin/${type === 'product' ? 'product-offer' : 'category-offer'}/${id}`;
      await axios.delete(endpoint);
      await fetchOffers();
      setActiveMenu(null);
    } catch (error) {
      console.error('Error deleting offer:', error);
      setError('Failed to delete offer');
    }
  };

  const handleMenuClick = (e, itemId, itemType) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    
    setMenuPosition({
      top: rect.bottom + window.scrollY - 130,
      left: rect.left + window.scrollX - 130, // Adjust this value to move the menu closer to the icon
    });
    
    setActiveMenu(activeMenu === `${itemType}-${itemId}` ? null : `${itemType}-${itemId}`);
  };

  const OfferTable = ({ title, offers = [], itemType }) => (
    <div className="bg-white rounded-lg shadow-sm border mb-8">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <button 
          onClick={() => navigate(`/admin/add${itemType.toLowerCase()}offer`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          <Plus className="w-5 h-5" />
          Add {itemType} Offer
        </button>
      </div>
      <div className="overflow-x-auto relative">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-4 text-gray-600 font-medium">{itemType.toUpperCase()}</th>
              <th className="text-left p-4 text-gray-600 font-medium">DISCOUNT</th>
              <th className="text-left p-4 text-gray-600 font-medium">VALIDITY</th>
              <th className="text-left p-4 text-gray-600 font-medium">STATUS</th>
              <th className="text-right p-4 text-gray-600 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {offers && offers.length > 0 ? (
              offers.map((offer, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4 text-gray-800">
                    {itemType === 'Product' ? offer.productName : offer.categoryName}
                  </td>
                  <td className="p-4 text-blue-600 font-medium">
                    {offer.offer?.percentage}%
                  </td>
                  <td className="p-4 text-gray-600">
                    {offer.offer?.startDate && new Date(offer.offer.startDate).toLocaleDateString()} - {offer.offer?.endDate && new Date(offer.offer.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      offer.offer?.isActive 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-yellow-700 bg-yellow-100'
                    }`}>
                      {offer.offer?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={(e) => handleMenuClick(e, offer._id, itemType)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 menu-trigger"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMenu === `${itemType}-${offer._id}` && portalContainer && createPortal(
                      <div 
                        className="fixed z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[160px] transition-opacity duration-200 ease-in-out"
                        style={{
                          top: `${menuPosition.top}px`,
                          left: `${menuPosition.left}px`,
                          opacity: activeMenu === `${itemType}-${offer._id}` ? 1 : 0,
                          pointerEvents: activeMenu === `${itemType}-${offer._id}` ? 'auto' : 'none',
                        }}
                      >
                        <button
                          onClick={() => handleStatusChange(offer._id, itemType.toLowerCase(), offer.offer?.isActive)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span className={`w-2 h-2 rounded-full ${offer.offer?.isActive ? 'bg-yellow-500' : 'bg-green-500'}`} />
                          {offer.offer?.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id, itemType.toLowerCase())}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Offer
                        </button>
                      </div>,
                      portalContainer
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No {itemType.toLowerCase()} offers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto" onClick={() => setActiveMenu(null)}>
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Offer Management</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-4 py-2 border rounded-lg w-36"
              />
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-4 py-2 border rounded-lg w-36"
              />
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search offers..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

         
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading offers...</div>
      ) : (
        <>
          <OfferTable title="Product Offers" offers={productOffers} itemType="Product" />
          <OfferTable title="Category Offers" offers={categoryOffers} itemType="Category" />
        </>
      )}
    </div>
  );
}

export default OfferManagement;

