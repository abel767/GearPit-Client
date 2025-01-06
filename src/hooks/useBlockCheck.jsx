import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // Add useSelector
import { userLogout } from "../redux/Slices/userSlice";
import axios from 'axios';

export const useBlockCheck = () => {
    const [isBlocked, setIsBlocked] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user); // Get user from Redux state

    const checkBlockStatus = async () => {
        const userId = user?._id || user?.id;
        if (!userId) return; // Don't make the request if there's no user ID

        try {
            const response = await axios.get(`http://localhost:3000/user/check-block-status/${userId}`, {
                withCredentials: true
            });
            setIsBlocked(response.data.isBlocked);
        } catch (error) {
            console.log('Block check response:', error.response?.data);
            if (error.response?.status === 403) {
                setIsBlocked(true);
                handleLogout(); // Automatically logout if blocked
            }
        }
    };

    useEffect(() => {
        // Only run checks if there's a logged-in user
        const userId = user?._id || user?.id;
        if (userId) {
            checkBlockStatus();
            const intervalId = setInterval(checkBlockStatus, 30000);
            return () => clearInterval(intervalId);
        }
    }, [user]); // Watch the entire user object

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3000/user/logout', {}, {
                withCredentials: true
            });
            dispatch(userLogout());
        } catch (error) {
            console.error('Logout failed:', error);
            dispatch(userLogout());
        }
    };

    return { isBlocked, handleLogout };
};