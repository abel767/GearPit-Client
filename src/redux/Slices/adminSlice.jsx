import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        isAuthenticated: false,
        user: null,
        role: 'admin'
    },
    reducers: {
        adminLogin: (state, action) => {
            const { user } = action.payload;
            state.isAuthenticated = true;
            state.user = {
                _id: user.id || user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                isAdmin: true,
                ...user
            };
            state.role = 'admin';
        },
        adminLogout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.role = 'admin';
        },
        updateAdminProfile: (state, action) => {
            state.user = {
                ...state.user,
                ...action.payload
            };
        }
    }
});

export const { adminLogin, adminLogout, updateAdminProfile } = adminSlice.actions;
export default adminSlice.reducer;