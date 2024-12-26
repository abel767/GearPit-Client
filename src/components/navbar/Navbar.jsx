import { useState } from "react";
import { Link } from "react-router-dom";
import { logout } from '../../redux/Slices/authSlice';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// Images
import logo from '../../assets/user/signup/logo 3.png';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());  // Dispatch the logout action
        navigate("/login");  // Redirect the user to the login page
    };

    return (
        <nav className="bg-black text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            {/* Logo */}
            <Link to="/">
                <img src={logo} alt="GearPit Logo" className="h-20" />
            </Link>

            {/* Links */}
            <div className="hidden md:flex space-x-6">
                <Link to="/" className="hover:text-gray-300">Home</Link>
                <Link to="/store" className="hover:text-gray-300">Store</Link>
                <Link to="/about" className="hover:text-gray-300">About Us</Link>
                <Link to="/contact" className="hover:text-gray-300">Contact Us</Link>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
                <div
                    onClick={toggleDropdown}
                    className="cursor-pointer bg-white text-black py-2 px-4 rounded-lg flex items-center space-x-2"
                >
                    <img
                        src={user?.profileImageUrl || 'default-profile-image-url'}  // Handling if no image
                        alt="Profile Icon"
                        className="m-h-6 m-w-6 rounded-full"
                    />
                    <span>Profile</span>
                </div>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg">
                        <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                        <Link to="/cart" className="block px-4 py-2 hover:bg-gray-100">Cart</Link>
                        <Link to="/wishlist" className="block px-4 py-2 hover:bg-gray-100">Wishlist</Link>
                        <Link onClick={handleLogout} to="/logout" className="block px-4 py-2 hover:bg-gray-100">Logout</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
