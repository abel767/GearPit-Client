import { useState } from "react"
import { Link } from "react-router-dom"
import { userLogout } from '../../redux/Slices/userSlice'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../api/axiosInstance"
import { User, Menu, X, Home, Phone, Info, Store, ShoppingCart, Heart, LogOut, Search } from 'lucide-react'
import logo from '../../assets/Logo/Logo2.png'
const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const { user } = useSelector((state) => state.user)

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/user/logout", {}, {
                withCredentials: true
            })

            try {
                const auth2 = window.gapi?.auth2?.getAuthInstance()
                if (auth2) {
                    await auth2.signOut()
                }
            } catch (error) {
                console.log('Not a Google session or Google sign-out failed', error)
            }

            dispatch(userLogout())
            localStorage.clear()
            sessionStorage.clear()
            navigate("/user/login")
            
        } catch (error) {
            console.error("Logout error:", error)
            dispatch(userLogout())
            localStorage.clear()
            sessionStorage.clear()
            navigate("/user/login")
        }
    }

    return (
        <>
            {/* Main Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-black ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 h-12 flex items-center">
                            <Link to="/user/home" className="flex items-center">
                                <img 
                                    src={logo}
                                    alt="Logo" 
                                    className="h-20 w-auto object-contain" 
                                />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setIsNavOpen(true)}
                            className="md:hidden text-gray-600 hover:text-gray-900"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Desktop Navigation - Center */}
                        <div className="hidden md:flex items-center space-x-20 flex-1 justify-center ">
                            <Link to="/user/home" className="text-white hover:text-gray-400">Home</Link>
                            <Link to="/user/store" className="text-white hover:text-gray-400">Store</Link>
                            <Link to="/about" className="text-white hover:text-gray-400">About Us</Link>
                            <Link to="/contact" className="text-white hover:text-gray-400">Contact</Link>
                        </div>

                        {/* Right Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/user/wishlist" className="text-white hover:text-gray-400">
                                <Heart className="h-6 w-6" />
                            </Link>
                            
                            <button className="text-white hover:text-gray-400">
                                <Search className="h-6 w-6" />
                            </button>

                            <Link to="/user/cart" className="text-white hover:text-gray-400">
                                <ShoppingCart className="h-6 w-6" />
                            </Link>

                            <Link to="/user/profile" className="text-white hover:text-gray-400">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            e.target.onerror = null
                                            e.target.src = 'data:image/svg+xml,...'
                                        }}
                                    />
                                ) : (
                                    <User className="h-6 w-6" />
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            <div className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`fixed top-0 right-0 h-full w-64 bg-white transform transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full p-4">
                        {/* Close Button */}
                        <button 
                            onClick={() => setIsNavOpen(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Icons Row */}
                        <div className="mt-16 flex justify-center space-x-6 pb-6 border-b border-gray-200">
                            <Link to="/wishlist" className="text-gray-600 hover:text-gray-900">
                                <Heart className="h-6 w-6" />
                            </Link>
                            <Link to="/user/cart" className="text-gray-600 hover:text-gray-900">
                                <ShoppingCart className="h-6 w-6" />
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900">
                                <Search className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 space-y-6 py-6">
                            <Link to="/user/home" 
                                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" 
                                onClick={() => setIsNavOpen(false)}
                            >
                                <Home size={20} />
                                <span>Home</span>
                            </Link>

                            <Link to="/user/store" 
                                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" 
                                onClick={() => setIsNavOpen(false)}
                            >
                                <Store size={20} />
                                <span>Store</span>
                            </Link>

                            <Link to="/about" 
                                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" 
                                onClick={() => setIsNavOpen(false)}
                            >
                                <Info size={20} />
                                <span>About Us</span>
                            </Link>

                            <Link to="/contact" 
                                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" 
                                onClick={() => setIsNavOpen(false)}
                            >
                                <Phone size={20} />
                                <span>Contact</span>
                            </Link>
                        </div>

                        {/* Profile and Logout Section */}
                        <div className="border-t border-gray-200 pt-6 space-y-6">
                        <Link 
    to="/user/profile" 
    className="text-gray-600 hover:text-gray-900"
    onClick={(e) => {
        if (!user?.id) {
            e.preventDefault();
            // Optionally show an error message or redirect to login
            navigate("/user/login");
        }
    }}
>
    {user?.profileImage ? (
        <img
            src={user.profileImage}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'default-profile-image.svg'; // Use a proper default image
            }}
        />
                                ) : (
                                    <User size={20} />
                                )}
                                <span>Profile</span>
                            </Link>

                            <button 
                                onClick={() => { handleLogout(); setIsNavOpen(false); }}
                                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 w-full"
                            >
                                <LogOut size={20} />
                                <span>Log-out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar