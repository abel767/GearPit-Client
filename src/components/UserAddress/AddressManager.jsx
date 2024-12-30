import { useState } from 'react';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';

export default function AddressManager() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      firstName: 'Abel',
      lastName: 'Thomas',
      address: '123 Main St',
      country: 'India',
      state: 'Kerala',
      city: 'Kottayam',
      pinCode: '67372',
      email: 'abel.thomas@example.com',
      phoneNumber: '1234567890'
    }
  ]);
  const [editingId, setEditingId] = useState(null);

  const addNewAddress = () => {
    setEditingId('new');
  };

  const editAddress = (id) => {
    setEditingId(id);
  };

  const deleteAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const saveAddress = (address) => {
    if (editingId === 'new') {
      setAddresses([...addresses, { ...address, id: Date.now() }]);
    } else {
      setAddresses(addresses.map(addr => addr.id === editingId ? { ...addr, ...address } : addr));
    }
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Shipping Addresses</h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map(address => (
              <div key={address.id} className="border rounded-lg p-4 bg-white shadow-sm relative">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">{address.firstName} {address.lastName}</h3>
                  <p className="text-sm text-gray-600">{address.address}, {address.city}, {address.state} {address.pinCode}</p>
                  <p className="text-sm text-gray-600">{address.email}</p>
                  <p className="text-sm text-gray-600">{address.phoneNumber}</p>
                </div>
                <AddressMenu onEdit={() => editAddress(address.id)} onDelete={() => deleteAddress(address.id)} />
              </div>
            ))}
          </div>

          {editingId && (
            <AddressForm
              address={editingId === 'new' ? {} : addresses.find(addr => addr.id === editingId)}
              onSave={saveAddress}
              onCancel={() => setEditingId(null)}
            />
          )}

          {addresses.length < 5 && !editingId && (
            <button
              onClick={addNewAddress}
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

function AddressForm({ address = {}, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    address: address.address || '',
    country: address.country || 'India',
    state: address.state || '',
    city: address.city || '',
    pinCode: address.pinCode || '',
    email: address.email || '',
    phoneNumber: address.phoneNumber || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select 
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          >
            <option value="India">India</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
          </select>
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <select 
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <select 
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          >
            <option value="">Select City</option>
            <option value="Kottayam">Kottayam</option>
            <option value="Trivandrum">Trivandrum</option>
            <option value="Kochi">Kochi</option>
          </select>
        </div>
        <div>
          <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
          <input
            id="pinCode"
            name="pinCode"
            type="text"
            value={formData.pinCode}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

function AddressMenu({ onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-2 right-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <MoreVertical size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              <Edit2 size={18} className="inline mr-2" />
              Edit
            </button>
            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              <Trash2 size={18} className="inline mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

