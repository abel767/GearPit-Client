import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Package, CheckCircle, Clock, Camera, Save } from 'lucide-react';
import { setEditing } from '../../redux/Slices/profileSlice';
import ChangePasswordButton from './CahngePasswordButton';
import uploadImageToCloudinary from '../../services/uploadImageToCloudinary';
import { updateUserProfile } from '../../redux/Slices/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { error, isEditing } = useSelector((state) => state.profile);
  
  const userId = user?._id || user?.id;


  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    userName: user?.userName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [orders, setOrders] = useState([]);
  const [fetchError, setFetchError] = useState(null);


  
// User data fetching with auth check
useEffect(() => {
  const fetchData = async () => {
    if (!isAuthenticated || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/user/profile/${userId}`);
      if (response.data?.userData) {
        setFormData({
          firstName: response.data.userData.firstName || '',
          lastName: response.data.userData.lastName || '',
          userName: response.data.userData.userName || '',
          email: response.data.userData.email || '',
          phone: response.data.userData.phone || '',
        });
        setProfileImage(response.data.userData.profileImage || '');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [userId, isAuthenticated]);


    
useEffect(() => {
  const fetchOrders = async () => {
    if (!isAuthenticated || !user?._id) return;

    try {
      const response = await axiosInstance.get(`/user/orders/user/${user._id}`);
      setOrders(response.data.data);
      setFetchError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setFetchError('Failed to load order data');
    }
  };

  fetchOrders();
}, [user?._id, isAuthenticated]);

const orderStats = {
  total: orders.length,
  pending: orders.filter(order => 
    ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status.toUpperCase())
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
        const response = await axiosInstance.get(`/user/profile/${userId}`);
        if (response.data.userData) {
          setFormData({
            firstName: response.data.userData.firstName || '',
            lastName: response.data.userData.lastName || '',
            userName: response.data.userData.userName || '',
            email: response.data.userData.email || '',
            phone: response.data.userData.phone || '',
          });
          setProfileImage(response.data.userData.profileImage || '');
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
    if (!userId) {
      alert('Please log in to update your profile');
      return;
    }
  
    // Basic validation
    if (!formData.firstName || !formData.email) {
      alert('First name and email are required');
      return;
    }
  
    try {
      setLoading(true);
  
      // Send formData directly in request body, not nested
      const response = await axiosInstance.put(`/user/profileupdate/${userId}`, formData);
  
      if (response.data) {
        dispatch(updateUserProfile(formData));
        dispatch(setEditing(false));
        
        setFormData(prev => ({
          ...prev,
          ...response.data.user
        }));
  
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid input data';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };



const handleImageUpload = async (event) => {
    if (!userId) {
      alert('Please log in to update your profile image');
      return;
    }
  
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
    // Show loading state if you want
    setLoading(true);

    const imageUrls = await uploadImageToCloudinary([file]);
    
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const cloudinaryUrl = imageUrls[0];
    
    if (!cloudinaryUrl) {
      throw new Error('No URL received from Cloudinary');
    }

    const response = await axiosInstance.put(`/user/profileImageupdate/${userId}`, {
      profileImage: cloudinaryUrl
    });

    if (response.data) {
      // Update both local and Redux state
      setProfileImage(cloudinaryUrl);
      dispatch(updateUserProfile({ profileImage: cloudinaryUrl }));
      
      // Optionally show success message
      alert('Profile image updated successfully');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    let errorMessage = 'Failed to upload image. Please try again.';
    
    if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    alert(errorMessage);
  } finally {
    setLoading(false);
    // Fetch user data only if needed
    try {
      await fetchUserData();
    } catch (fetchError) {
      console.error('Error fetching updated user data:', fetchError);
      // Don't show this error to user since the image update already worked
    }
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