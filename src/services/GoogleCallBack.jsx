import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { userLogin, setAuthLoading } from '../redux/Slices/userSlice';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const verifyAuth = async () => {
            dispatch(setAuthLoading(true));
            try {
                // Get token and status from URL
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                const status = params.get('status');

                if (!token || status !== 'success') {
                    console.error('Invalid token or status');
                    navigate('/user/login');
                    return;
                }

                // Set token in axios headers
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const response = await axiosInstance.get('/auth/google/success', {
                    withCredentials: true
                });

                if (response.data && !response.data.error) {
                    const userData = {
                        user: {
                            id: response.data.user.id,
                            firstName: response.data.user.firstName,
                            lastName: response.data.user.lastName,
                            email: response.data.user.email,
                            profileImage: response.data.user.profileImage,
                            verified: true,
                            isGoogleUser: true
                        },
                        tokens: {
                            accessToken: token
                        }
                    };

                    dispatch(userLogin(userData));
                    navigate('/user/home', { replace: true });
                } else {
                    throw new Error('Authentication failed');
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                navigate('/user/login');
            } finally {
                dispatch(setAuthLoading(false));
            }
        };

        verifyAuth();
    }, [dispatch, navigate, location]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl font-semibold">
                Completing login...
            </div>
        </div>
    );
};

export default GoogleCallback;