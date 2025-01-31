import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { fetchAddresses, addAddress, updateAddress, deleteAddress } from '../../redux/Slices/addressSlice';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

// Menu Component for edit/delete actions
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
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <button
            onClick={() => { onEdit(); setIsOpen(false); }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Edit2 size={18} className="inline mr-2" />
            Edit
          </button>
          <button
            onClick={() => { onDelete(); setIsOpen(false); }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <Trash2 size={18} className="inline mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

AddressMenu.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// Validation utilities
const validateField = (name, value) => {
  switch (name) {
    case 'firstName':
    case 'lastName':
      if (!value) return 'This field is required';
      if (value.length < 2) return 'Must be at least 2 characters';
      if (!/^[a-zA-Z\s]*$/.test(value)) return 'Only letters and spaces allowed';
      if (/^\s+$/.test(value)) return 'Cannot contain only spaces';
      break;
    case 'address':
      if (!value) return 'Address is required';
      if (value.length < 10) return 'Address must be at least 10 characters';
      if (/^\s+$/.test(value)) return 'Cannot contain only spaces';
      if (/^[_\s]*$/.test(value)) return 'Cannot contain only underscores or spaces';
      break;
    case 'phoneNumber':
      if (!value) return 'Phone number is required';
      if (!/^\d{10}$/.test(value)) return 'Must be exactly 10 digits';
      if (/^0{10}$/.test(value)) return 'Cannot be all zeros';
      if (/^(\d)\1{9}$/.test(value)) return 'Cannot be all same digits';
      break;
    case 'pincode':
      if (!value) return 'Pincode is required';
      if (!/^\d{6}$/.test(value)) return 'Must be exactly 6 digits';
      if (/^0{6}$/.test(value)) return 'Cannot be all zeros';
      if (/^(\d)\1{5}$/.test(value)) return 'Cannot be all same digits';
      break;
    case 'state':
    case 'city':
      if (!value) return 'This field is required';
      break;
    default:
      return '';
  }
  return '';
};

// AddressForm Component
const AddressForm = ({ address, onSave, onCancel }) => {
  const initialFormData = {
    firstName: '',
    lastName: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    phoneNumber: '',
    country: 'India',
    ...address // Spread the address prop if it exists
  };

  const [formData, setFormData] = useState(initialFormData);
  // const [errors, setErrors] = useState({});
  // const [touched, setTouched] = useState({});


  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});


  // Form event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    try {
      await onSave(formData);
      toast.success('Address saved successfully!', {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to save address. Please try again.', {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2";
    const hasError = touched[fieldName] && errors[fieldName];
    return `${baseClasses} ${
      hasError
        ? 'border-red-300 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-500'
    }`;
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
            onBlur={handleBlur}
            className={getInputClassName('firstName')}
          />
          {touched.firstName && errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
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
            onBlur={handleBlur}
            className={getInputClassName('lastName')}
          />
          {touched.lastName && errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
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
          onBlur={handleBlur}
          className={getInputClassName('address')}
          placeholder="Enter your full street address"
        />
        {touched.address && errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClassName('state')}
          >
            <option value="">Select State</option>
            <option value="Kerala">Kerala</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
          </select>
          {touched.state && errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClassName('city')}
          >
            <option value="">Select City</option>
            <option value="Kottayam">Kottayam</option>
            <option value="Trivandrum">Trivandrum</option>
            <option value="Kochi">Kochi</option>
          </select>
          {touched.city && errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>
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
          onBlur={handleBlur}
          maxLength="6"
          className={getInputClassName('pincode')}
          placeholder="Enter 6-digit pincode"
        />
        {touched.pincode && errors.pincode && (
          <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
        )}
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
          onBlur={handleBlur}
          maxLength="10"
          className={getInputClassName('phoneNumber')}
          placeholder="Enter 10-digit phone number"
        />
        {touched.phoneNumber && errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

AddressForm.propTypes = {
  address: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    address: PropTypes.string,
    state: PropTypes.string,
    city: PropTypes.string,
    pincode: PropTypes.string,
    phoneNumber: PropTypes.string,
    country: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

AddressForm.defaultProps = {
  address: null // Changed from object to null
};

function AddressManager() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const { addresses, loading, error } = useSelector((state) => state.address);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  // Fetch addresses when component mounts or user changes
  useEffect(() => {
    if (user?.user?._id) {
      dispatch(fetchAddresses(user.user._id))
        .unwrap()
        .catch((error) => {
          toast.error('Failed to fetch addresses: ' + error.message);
        });
    }
  }, [dispatch, user?.user?._id]);

  // Handle adding new address
  const handleAddAddress = async (addressData) => {
    if (!user?.user?._id) return;
    
    try {
      await dispatch(addAddress({
        userId: user.user._id,
        addressData: { ...addressData, country: 'India' }
      })).unwrap();
      
      await dispatch(fetchAddresses(user.user._id));
      setIsEditing(false);
      toast.success('Address added successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to add address');
    }
  };

  // Handle updating existing address
  const handleUpdateAddress = async (addressData) => {
    if (!user?.user?._id || !currentAddress) return;
    
    try {
      await dispatch(updateAddress({
        userId: user.user._id,
        addressId: currentAddress._id,
        addressData: { ...addressData, country: 'India' }
      })).unwrap();
      
      await dispatch(fetchAddresses(user.user._id));
      setCurrentAddress(null);
      setIsEditing(false);
      toast.success('Address updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update address');
    }
  };

  // Handle deleting address
  const handleDeleteAddress = async (addressId) => {
    if (!user?.user?._id) return;
    
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await dispatch(deleteAddress({ 
        userId: user.user._id, 
        addressId 
      })).unwrap();
      
      await dispatch(fetchAddresses(user.user._id));
      toast.success('Address deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete address: ' + error.message);
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-4 text-gray-600">Loading addresses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-4 text-red-500">
          Error loading addresses: {error}
          <button 
            onClick={() => dispatch(fetchAddresses(user?.user?._id))}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Shipping Addresses</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your shipping addresses ({addresses.length}/5 addresses)
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Address Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <div 
                key={address._id} 
                className="border rounded-lg p-4 bg-white shadow-sm relative hover:shadow-md transition-shadow"
              >
                <AddressMenu 
                  onEdit={() => {
                    setCurrentAddress(address);
                    setIsEditing(true);
                  }} 
                  onDelete={() => handleDeleteAddress(address._id)} 
                />
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">
                    {address.firstName} {address.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {address.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.pincode}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {address.phoneNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Form or Add Button */}
          {isEditing ? (
            <AddressForm
              address={currentAddress}
              onSave={currentAddress ? handleUpdateAddress : handleAddAddress}
              onCancel={() => {
                setCurrentAddress(null);
                setIsEditing(false);
              }}
            />
          ) : addresses.length < 5 && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium 
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                transition-colors duration-200"
            >
              <Plus size={20} className="inline mr-2" />
              Add New Address
            </button>
          )}

          {/* Maximum addresses message */}
          {addresses.length >= 5 && !isEditing && (
            <p className="text-sm text-amber-600 bg-amber-50 p-4 rounded-md">
              You've reached the maximum number of allowed addresses (5).
              Delete an existing address to add a new one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressManager;