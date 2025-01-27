import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLogout } from '../../redux/Slices/userSlice';
import { Menu, X, User, History, MapPin, ShoppingCart, Heart, Wallet, LogOut } from 'lucide-react';
import Logo from '../../assets/Logo/Logo2.png';
import axiosInstance from '../../api/axiosInstance';

const UserSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/user/logout", {}, {
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

  const menuItems = [
    { icon: User, text: "Account", to: "/user/profile" },
    { icon: History, text: "Orders", to: "/user/OrderHistory" },
    { icon: MapPin, text: "Track", to: "/track-order" },
    { icon: ShoppingCart, text: "Cart", to: "/user/cart" },
    { icon: Heart, text: "Wishlist", to: "/user/wishlist" },
    { icon: MapPin, text: "Address", to: "/user/address" },
    { icon: Wallet, text: "Wallet", to: "/user/wallet" },
    { icon: LogOut, text: "Logout", action: handleLogout },
  ];

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-black text-white md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop - Only visible when mobile menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar for desktop/tablet and Mobile menu */}
      <div className={`
        fixed md:sticky top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300
        bg-black
        md:w-16 lg:w-64 w-64
        min-h-screen
        z-40
        flex flex-col
      `}>
        {/* Logo area */}
        <div className="p-4 border-b border-gray-800">
          <img 
            src={Logo} 
            alt="Logo"
            onClick={() => navigate('/user/home')}
            className="w-32 mx-auto lg:mx-0 cursor-pointer transition-transform hover:scale-105"
          />
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-8 flex-grow">
          {menuItems.map(({ icon: Icon, text, action, to }) => (
            <button
              key={text}
              onClick={(e) => {
                action ? action(e) : navigate(to);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full p-2 rounded-lg text-gray-400 
                hover:text-white hover:bg-gray-800 
                transition-all duration-300 ease-in-out
                hover:translate-x-1
                group"
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="lg:block hidden">{text}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.slice(0, 4).map(({ icon: Icon, text, action, to }) => (
            <button
              key={text}
              onClick={action || (() => navigate(to))}
              className="flex flex-col items-center p-2 text-gray-400 
                hover:text-white transition-colors duration-300"
            >
              <Icon className="w-5 h-5 transition-transform hover:scale-110" />
              <span className="text-xs mt-1">{text}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default UserSidebar;