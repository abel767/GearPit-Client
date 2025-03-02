import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "../redux/Slices/userSlice";
import axiosInstance from '../api/axiosInstance'; // Use your configured axios instance

export const useBlockCheck = () => {
    const [isBlocked, setIsBlocked] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

    const checkBlockStatus = async () => {
        const userId = user?._id || user?.id;
        if (!userId) return;

        try {
            const response = await axiosInstance.get(`/user/check-block-status/${userId}`);
            setIsBlocked(response.data.isBlocked);
        } catch (error) {
            console.log('Block check response:', error.response?.data);
            if (error.response?.status === 403) {
                setIsBlocked(true);
                handleLogout();
            }
        }
    };

    useEffect(() => {
        const userId = user?._id || user?.id;
        if (userId) {
            checkBlockStatus();
            const intervalId = setInterval(checkBlockStatus, 30000);
            return () => clearInterval(intervalId);
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/user/logout', {});
            dispatch(userLogout());
        } catch (error) {
            console.error('Logout failed:', error);
            dispatch(userLogout());
        }
    };

    return { isBlocked, handleLogout };
};