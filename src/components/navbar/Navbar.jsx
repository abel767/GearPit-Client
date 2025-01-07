import { useState } from "react";
import { Link } from "react-router-dom";
import { userLogout } from '../../redux/Slices/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { User } from 'lucide-react'; // Import User icon for fallback

// Images
import logo from '../../assets/Logo/logo.png';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { user } = useSelector((state) => state.user);
    
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:3000/user/logout", {}, {
                withCredentials: true
            });

            try {
                const auth2 = window.gapi?.auth2?.getAuthInstance();
                if (auth2) {
                    await auth2.signOut();
                }
            } catch (error) {
                console.log('Not a Google session or Google sign-out failed', error);
            }

            dispatch(userLogout());
            localStorage.clear();
            sessionStorage.clear();
            navigate("/user/login");
            
        } catch (error) {
            console.error("Logout error:", error);
            dispatch(userLogout());
            localStorage.clear();
            sessionStorage.clear();
            navigate("/user/login");
        }
    };

    const renderProfileImage = () => {
        if (imageError || !user?.profileImage) {
            return (
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                </div>
            );
        }

        return (
            <img
                src={user.profileImage}
                alt="Profile"
                className="h-7 w-7 rounded-full object-cover"
                onError={handleImageError}
            />
        );
    };

    return (
        <nav className="bg-black text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/user/home">
                <img src={logo} alt="GearPit Logo" className="h-20" />
            </Link>

            <div className="hidden md:flex space-x-6">
                <Link to="/user/home" className="hover:text-gray-300" >Home</Link>
                <Link to="/user/store" className="hover:text-gray-300" onClick={()=> navigate('/user/store')}>Store</Link>
                <Link to="/about" className="hover:text-gray-300">About Us</Link>
                <Link to="/contact" className="hover:text-gray-300">Contact Us</Link>
            </div>

            <div className="relative">
                <div
                    onClick={toggleDropdown}
                    className="cursor-pointer bg-white text-black py-2 px-4 rounded-lg flex items-center space-x-2"
                >
                    {renderProfileImage()}
                    <span>{user?.userName || 'Profile'}</span>
                </div>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg">
                        <Link to="/user/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                        <Link to="/user/cart" className="block px-4 py-2 hover:bg-gray-100">Cart</Link>
                        <Link to="/wishlist" className="block px-4 py-2 hover:bg-gray-100">Wishlist</Link>
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;