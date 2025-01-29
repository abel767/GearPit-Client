import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isAuthenticated: false,
        user: null,
        role: 'user',
        isBlocked: false,
        isLoading: false,
        tokens: {
            accessToken: null
        }
    },
    reducers: {
        userLogin: (state, action) => {
            const { user, tokens } = action.payload;
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
                isBlocked: user.isBlocked
            };
            state.tokens = tokens;
            state.role = 'user';
        },
        userLogout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.role = 'user';
            state.tokens = {
                accessToken: null
            };
        },
        setBlockedStatus: (state, action) => {
            state.isBlocked = action.payload;
            if (action.payload) {
                state.isAuthenticated = false;
                state.user = null;
            }
        },
        updateUserProfile: (state, action) => {
            state.user = {
                ...state.user,
                ...action.payload
            };
        },
        setAuthLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        updateTokens: (state, action) => {
            state.tokens = {
                ...state.tokens,
                ...action.payload
            };
        }
    }
});

export const { 
    userLogin, 
    userLogout, 
    updateUserProfile, 
    setBlockedStatus, 
    setAuthLoading,
    updateTokens 
} = userSlice.actions;

export default userSlice.reducer;