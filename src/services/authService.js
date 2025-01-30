import axiosInstance from '../api/axiosInstance';
import { store } from '../redux/store';
import { userLogin, userLogout, setAuthLoading } from '../redux/Slices/userSlice';
import { adminLogin, adminLogout } from '../redux/Slices/adminSlice';

const handleAuthError = () => {
    const state = store.getState();
    if (state.admin.isAuthenticated) {
        store.dispatch(adminLogout());
    } else if (state.user.isAuthenticated) {
        store.dispatch(userLogout());
    }
};



const handleError = (error) => {
    if (error.response?.status === 401) {
        handleAuthError();
    }
    throw error;
};

const formatUserData = (userData) => {
    return {
      user: {
        id: userData.id || userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userName: userData.userName,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        verified: userData.verified,
        isBlocked: userData.isBlocked,
        isAdmin: false,
        isGoogleUser: userData.isGoogleUser || false
      },
      tokens: {
        accessToken: userData.accessToken || userData.token
      }
    };
  };
  


const formatAdminData = (adminData) => {
    return {
        user: {
            id: adminData.id || adminData._id,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            userName: adminData.userName,
            email: adminData.email,
            phone: adminData.phone,
            profileImage: adminData.profileImage,
            isAdmin: true,
            ...adminData
        }
    };
};

export const handleGoogleLoginSuccess = async (userData) => {
    try {
      store.dispatch(setAuthLoading(true));
      
      const formattedData = {
        user: {
          id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          userName: userData.userName,
          email: userData.email,
          profileImage: userData.profileImage,
          verified: true,
          isBlocked: false,
          isAdmin: false,
          isGoogleUser: true
        },
        tokens: {
          accessToken: userData.accessToken
        }
      };
  
      store.dispatch(userLogin(formattedData));
  
      // Set authorization header
      if (userData.accessToken) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
      }
  
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      handleAuthError();
      return false;
    } finally {
      store.dispatch(setAuthLoading(false));
    }
  };

  const loginUser = async (credentials) => {
    try {
      store.dispatch(setAuthLoading(true));
      
      const response = await axiosInstance.post('/user/login', credentials, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Login response from server:', response.data); // Debug log
  
      if (!response.data || !response.data.user) {
        throw new Error('Invalid response from server');
      }
  
      const formattedData = {
        user: {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          userName: response.data.user.userName,
          email: response.data.user.email,
          phone: response.data.user.phone,
          profileImage: response.data.user.profileImage,
          verified: response.data.user.verified,
          isBlocked: response.data.user.isBlocked,
          isAdmin: false,
        },
        tokens: {
          accessToken: response.data.accessToken
        }
      };
  
      console.log('Formatted user data:', formattedData); // Debug log
      
      // Dispatch to Redux store
      store.dispatch(userLogin(formattedData));
      
      // Set authorization header
      if (response.data.accessToken) {
        axiosInstance.defaults.headers.common['Authorization'] = 
          `Bearer ${response.data.accessToken}`;
      }
  
      return response.data;
    } catch (error) {
      console.error('Login error in service:', error); // Debug log
      if (error.response?.status === 401) {
        handleAuthError();
      }
      throw error;
    } finally {
      store.dispatch(setAuthLoading(false));
    }
  };


const loginAdmin = async (credentials) => {
    try {
        const response = await axiosInstance.post('/admin/login', credentials);
        const formattedData = formatAdminData(response.data.user);
        store.dispatch(adminLogin(formattedData));
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

const logoutUser = async () => {
    try {
        await axiosInstance.post('/user/logout', {}, { withCredentials: true });
        // Clear authorization header
        delete axiosInstance.defaults.headers.common['Authorization'];
        store.dispatch(userLogout());
    } catch (error) {
        console.error('Logout error:', error);
        store.dispatch(userLogout());
    }
};

const logoutAdmin = async () => {
    try {
        await axiosInstance.post('/admin/logout');
        store.dispatch(adminLogout());
    } catch (error) {
        console.error('Admin logout error', error);
        store.dispatch(adminLogout());
    }
};

const refreshToken = async () => {
    try {
        const response = await axiosInstance.post('/user/refresh-token', {}, {
            withCredentials: true
        });

        const state = store.getState();
        
        if (state.admin.isAuthenticated) {
            const formattedData = formatAdminData(response.data.user);
            store.dispatch(adminLogin(formattedData));
        } else {
            const formattedData = formatUserData(response.data.user);
            store.dispatch(userLogin(formattedData));
        }

        // Update authorization header
        if (response.data.accessToken) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        }

        return response.data;
    } catch (error) {
        handleAuthError();
        throw error;
    }
};

const checkAuthStatus = async () => {
  try {
    store.dispatch(setAuthLoading(true));
    
    // First try /auth/google/success for Google OAuth
    const response = await axiosInstance.get('/auth/google/success', {
      withCredentials: true
    }).catch(() => {
      // If Google check fails, try regular auth check
      return axiosInstance.get('/auth/login/success', {
        withCredentials: true
      });
    });

    if (response.data && !response.data.error) {
      const formattedData = formatUserData(response.data.user);
      store.dispatch(userLogin(formattedData));
      
      if (response.data.token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      return { isAuthenticated: true, user: formattedData.user };
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error('Auth check error:', error);
    handleAuthError();
    return { isAuthenticated: false };
  } finally {
    store.dispatch(setAuthLoading(false));
  }
};

  

export {
    loginUser,
    logoutUser,
    loginAdmin,
    logoutAdmin,
    refreshToken,
    checkAuthStatus,
    handleAuthError,
    
};