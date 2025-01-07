import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userLogout } from '../../redux/Slices/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { User, Menu, X, Home, Phone, Info, Store, ShoppingCart, Heart, LogOut } from 'lucide-react';

const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [hamburgerColor, setHamburgerColor] = useState('white');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { user } = useSelector((state) => state.user);
    
    useEffect(() => {
        const changeNavbarColor = () => {
            if (window.scrollY >= 80) {
                setHamburgerColor('black');
            } else {
                setHamburgerColor('white');
            }
        };

        window.addEventListener('scroll', changeNavbarColor);

        return () => {
            window.removeEventListener('scroll', changeNavbarColor);
        };
    }, []);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
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

    return (
        <>
            {/* Hamburger/Close button */}
            <button 
                onClick={toggleNav} 
                className={`fixed top-4 right-4 z-50 focus:outline-none transition-all duration-300 ease-in-out ${isNavOpen ? 'transform rotate-180' : ''}`}
                style={{ color: isNavOpen ? 'white' : hamburgerColor }}
            >
                {isNavOpen ? (
                    <X size={24} className="transform rotate-180" />
                ) : (
                    <Menu size={24} />
                )}
            </button>

            {/* Side Navigation */}
            <div className={`fixed top-0 right-0 h-full w-64 bg-black text-white transform ${isNavOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-40`}>
                <div className="flex flex-col h-full p-4">
                    {/* Navigation links */}
                    <div className="space-y-6 mt-16">
                        <Link to="/user/home" 
                            className="flex items-center space-x-3 text-white hover:text-gray-300" 
                            onClick={toggleNav}
                        >
                            <Home size={20} />
                            <span>Home</span>
                        </Link>

                        <Link to="/contact" 
                            className="flex items-center space-x-3 text-white hover:text-gray-300" 
                            onClick={toggleNav}
                        >
                            <Phone size={20} />
                            <span>Contact us</span>
                        </Link>

                        <Link to="/about" 
                            className="flex items-center space-x-3 text-white hover:text-gray-300" 
                            onClick={toggleNav}
                        >
                            <Info size={20} />
                            <span>About Us</span>
                        </Link>

                        <Link to="/user/store" 
                            className="flex items-center space-x-3 text-white hover:text-gray-300" 
                            onClick={() => { toggleNav(); navigate('/user/store'); }}
                        >
                            <Store size={20} />
                            <span>Store</span>
                        </Link>

                        <Link to="/user/cart" 
                            className="flex items-center space-x-3 text-white hover:text-gray-300" 
                            onClick={toggleNav}
                        >
                            <ShoppingCart size={20} />
                            <span>Cart</span>
                        </Link>

                        <Link to="/wishlist" 
                            className="flex items-center space-x-3 text-white hover:text-gray-300" 
                            onClick={toggleNav}
                        >
                            <Heart size={20} />
                            <span>Wishlist</span>
                        </Link>

                        <button 
                            onClick={() => { handleLogout(); toggleNav(); }}
                            className="flex items-center space-x-3 text-white hover:text-gray-300 w-full"
                        >
                            <LogOut size={20} />
                            <span>Log-out</span>
                        </button>
                    </div>

                    {/* User profile at bottom */}
                    <div className="mt-auto pt-6 border-t border-gray-800">
                        <div className="flex items-center space-x-3">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml,...'; // Fallback to User icon
                                    }}
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                                    <User size={20} className="text-gray-400" />
                                </div>
                            )}
                            <Link 
                                to="/user/profile" 
                                className="text-sm text-white hover:text-gray-300 font-bold"
                                onClick={toggleNav}
                            >
                                {user?.firstName || 'Profile'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;

