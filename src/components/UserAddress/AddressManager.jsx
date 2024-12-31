import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { fetchAddresses, addAddress, updateAddress, deleteAddress } from '../../redux/Slices/addressSlice';

export default function AddressManager() {
  const dispatch = useDispatch();
  const { addresses, loading, error } = useSelector((state) => state.address);
  const { user } = useSelector((state) => state.auth);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchAddresses(user._id));
    }
  }, [dispatch, user?._id]);

  const handleAddAddress = async (addressData) => {
    if (user?._id) {
        try{
            console.log('Sending address data:', addressData);
            const result = await dispatch(addAddress({ 
                userId: user._id, 
                addressData 
              })).unwrap();

              console.log('Address addition result:', result);

              setCurrentAddress(null);
              setIsEditing(false);

              dispatch(fetchAddresses(user._id));


        }catch(error){
            console.error('Failed to add address:', error);
        }

    }
  };

  const handleUpdateAddress = async (addressData) => {
    if (user?._id && currentAddress) {
      await dispatch(updateAddress({
        userId: user._id,
        addressId: currentAddress.id,
        addressData,
      }));
      setCurrentAddress(null);
      setIsEditing(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (user?._id) {
      await dispatch(deleteAddress({ userId: user._id, addressId }));
    }
  };

  const startEditing = (address) => {
    setCurrentAddress(address);
    setIsEditing(true);
  };

  const startAdding = () => {
    setCurrentAddress(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setCurrentAddress(null);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Shipping Addresses</h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4 bg-white shadow-sm relative">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">{address.firstName} {address.lastName}</h3>
                  <p className="text-sm text-gray-600">{address.address}, {address.city}, {address.state} {address.pinCode}</p>
                  <p className="text-sm text-gray-600">{address.email}</p>
                  <p className="text-sm text-gray-600">{address.phoneNumber}</p>
                </div>
                <AddressMenu onEdit={() => startEditing(address)} onDelete={() => handleDeleteAddress(address.id)} />
              </div>
            ))}
          </div>

          {isEditing && (
            <AddressForm
              address={currentAddress}
              onSave={currentAddress ? handleUpdateAddress : handleAddAddress}
              onCancel={cancelEditing}
            />
          )}

          {addresses.length < 5 && !isEditing && (
            <button
              onClick={startAdding}
              className="w-full sm:w-auto py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              <Plus size={20} className="inline mr-2" />
              Add New Address
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



const AddressForm = ({ address, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      firstName: address?.firstName || '',
      lastName: address?.lastName || '',
      address: address?.address || '',  // Changed from street to address to match schema
      country: address?.country || 'India',
      state: address?.state || '',
      city: address?.city || '',
      pincode: address?.pincode || '',  // Changed from pinCode to pincode to match schema
      phoneNumber: address?.phoneNumber || ''
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form data:', formData);
      
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'pincode', 'phoneNumber'];
        const missingFields = requiredFields.filter(field => !formData[field]);
      
        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          alert('Please fill in all required fields: ' + missingFields.join(', '));
          return;
        }
      
        try {
          await onSave(formData);
          console.log('Address saved successfully');
        } catch (error) {
          console.error('Error saving address:', error);
        }
      };
      
  
    return (
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
  
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter your full street address"
          />
        </div>
  
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="India">India</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
            </select>
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select State</option>
              <option value="Kerala">Kerala</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>
        </div>
  
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select City</option>
              <option value="Kottayam">Kottayam</option>
              <option value="Trivandrum">Trivandrum</option>
              <option value="Kochi">Kochi</option>
            </select>
          </div>
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              value={formData.pincode}
              onChange={handleChange}
              required
              pattern="[0-9]{6}"
              maxLength="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter 6-digit pincode"
            />
          </div>
        </div>
  
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            maxLength="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter 10-digit phone number"
          />
        </div>
  
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  };




function AddressMenu({ onEdit, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <MoreVertical size={20} />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white">
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="block px-4 py-2 text-sm text-gray-700"
            >
              <Edit2 size={18} className="inline mr-2" />
              Edit
            </button>
            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              className="block px-4 py-2 text-sm text-gray-700"
            >
              <Trash2 size={18} className="inline mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }
