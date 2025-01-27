import { useEffect, useState } from 'react';
import axios from 'axios'
import axiosInstance from '../../api/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Package, CheckCircle, Clock, Camera, Save } from 'lucide-react';
import { setEditing } from '../../redux/Slices/profileSlice';
import ChangePasswordButton from './CahngePasswordButton';
import uploadImageToCloudinary from '../../services/uploadImageToCloudinary';
const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const {  error, isEditing } = useSelector((state) => state.profile);
    
    const [profileImage, setProfileImage] = useState(user?.profileImage || '');
    const [formData, setFormData] = useState({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      userName: user?.userName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });

    const [orders, setOrders] = useState([]);

  
    useEffect(() => {
      if (user?.id) {
        fetchUserData();
      }
    }, [user?.id]);
    
    // fetching order data
    useEffect(() => {
      const fetchOrders = async () => {
        if (user?._id) {
          try {
            const response = await axiosInstance.get(`/user/orders/user/${user._id}`);
            setOrders(response.data.data);
          } catch (err) {
            console.error('Error fetching orders:', err);
          }
        }
      };
      fetchOrders();
    }, [user?._id]);

    const orderStats = {
      total: orders.length,
      pending: orders.filter(order => 
        order.status.toUpperCase() === 'PENDING' || 
        order.status.toUpperCase() === 'PROCESSING' ||
        order.status.toUpperCase() === 'SHIPPED'
      ).length,
      completed: orders.filter(order => 
        order.status.toUpperCase() === 'DELIVERED'
      ).length
    };

  
    // Update profileImage when user data changes
    useEffect(() => {
      if (user?.profileImage) {
        setProfileImage(user.profileImage);
      }
    }, [user?.profileImage]);
  
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/profile/${user.id}`, {
          credentials: 'include',
          headers:{
              'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        
        if (response.ok && data.userData) {
          setFormData({
            firstName: data.userData.firstName || '',
            lastName: data.userData.lastName || '',
            userName: data.userData.userName || '',
            email: data.userData.email || '',
            phone: data.userData.phone || '',
          });
          // Update profile image state
          setProfileImage(data.userData.profileImage || '');
        } else {
          throw new Error(data.message || 'Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/profileupdate/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setEditing(false));
        await fetchUserData();
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum size is 5MB');
      return;
    }

    try {
      console.log('Starting image upload process...');
      const imageUrls = await uploadImageToCloudinary([file]);
      
      console.log('Cloudinary response:', imageUrls);

      if (!imageUrls || imageUrls.length === 0) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const cloudinaryUrl = imageUrls[0];
      console.log('Cloudinary URL:', cloudinaryUrl);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/profileImageupdate/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          profileImage: cloudinaryUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile image');
      }

      const data = await response.json();
      console.log('Profile update response:', data);
      
      // Update the profile image state immediately
      setProfileImage(cloudinaryUrl);
      
      // Force a re-fetch of user data
      await fetchUserData();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full w-full bg-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome back, {formData.firstName}
          </h1>
          <p className="text-gray-600">
            Manage your profile information and account settings
          </p>
        </div>

        {/* Profile Image Section */}
          <div className="relative group">
          <label className="cursor-pointer block">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <div className="relative">
              <img
                src={profileImage || "/api/placeholder/96/96"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                key={profileImage}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{orderStats.pending}</p>
                <p className="text-sm text-gray-600">Pending Orders</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{orderStats.completed}</p>
                <p className="text-sm text-gray-600">Completed Orders</p>
              </div>
            </div>
          </div>
        </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <button 
              onClick={() => dispatch(setEditing(!isEditing))}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isEditing ? (
                <Save className="w-4 h-4" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">First Name</label>
              <input
                type="text"
                name="firstName"
                disabled={!isEditing}
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Last Name</label>
              <input
                type="text"
                name="lastName"
                disabled={!isEditing}
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Username</label>
              <input
                type="text"
                name="userName"
                disabled={!isEditing}
                value={formData.userName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Phone</label>
              <input
                type="tel"
                name="phone"
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <ChangePasswordButton userId={user?.id} />

          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => dispatch(setEditing(false))}
                className="px-4 py-2 border border-black bg-black text-white rounded-lg hover:bg-gray-50 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-8">
          {error}
        </div>
      )}
    </div>
  );
};

export default Profile;