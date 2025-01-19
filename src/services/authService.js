import axiosInstance from '../api/axiosInstance';
import { store } from '../redux/store';
import { userLogin, userLogout } from '../redux/Slices/userSlice';
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
            ...userData
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

const loginUser = async (credentials) => {
    try {
        const response = await axiosInstance.post('/user/login', credentials);
        const formattedData = formatUserData(response.data.user);
        store.dispatch(userLogin(formattedData));
        return response.data;
    } catch (error) {
        throw handleError(error);
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
        await axiosInstance.post('/user/logout');
        store.dispatch(userLogout());
    } catch (error) {
        console.error('Logout error: ', error);
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
        const response = await axiosInstance.post('/user/refresh-token');
        const state = store.getState();

        if (state.admin.isAuthenticated) {
            const formattedData = formatAdminData(response.data.user);
            store.dispatch(adminLogin(formattedData));
        } else {
            const formattedData = formatUserData(response.data.user);
            store.dispatch(userLogin(formattedData));
        }

        return response.data;
    } catch (error) {
        handleAuthError();
        throw error;
    }
};

const checkAuthStatus = async () => {
    try {
        const response = await axiosInstance.get('/user/check-auth');
        const state = store.getState();

        if (state.response.data.isAuthenticated) {
            if (response.data.role === 'admin') {
                const formattedData = formatAdminData(response.data.user);
                store.dispatch(adminLogin(formattedData));
            } else {
                const formattedData = formatUserData(response.data.user);
                store.dispatch(userLogin(formattedData));
            }
        }

        return response.data;
    } catch (error) {
        console.error('check auth error', error)
        handleAuthError();
        return { isAuthenticated: false };

    }
};

export {
    loginUser,
    logoutUser,
    loginAdmin,
    logoutAdmin,
    refreshToken,
    checkAuthStatus,
    handleAuthError
};