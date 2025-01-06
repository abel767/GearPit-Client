import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isAuthenticated: false,
        user: null,
        role: 'user',
        isBlocked: false,
        
    },
    reducers: {
        userLogin: (state, action) => {
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
                verified: user.verified,
                isAdmin: false,
                isBlocke: user.isBlocked,
                ...user
            };
            state.role = 'user';
        },
        userLogout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.role = 'user';
        },
        setBlockedStatus: (state, action) => {
            state.isBlocked = action.payload;
        },
        updateUserProfile: (state, action) => {
            state.user = {
                ...state.user,
                ...action.payload
            };
        }
    }
});

export const { userLogin, userLogout, updateUserProfile, setBlockedStatus  } = userSlice.actions;
export default userSlice.reducer;