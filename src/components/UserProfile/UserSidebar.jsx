import { useNavigate } from 'react-router-dom';
import { User, History, MapPin, ShoppingCart, Heart, Wallet, LogOut } from 'lucide-react';
import logo from '../../assets/Logo/logo.png';
import { useDispatch } from 'react-redux';
import { userLogout } from '../../redux/Slices/userSlice';
import axiosInstance from '../../api/axiosInstance';

export default function UserSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch()
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
    <div className="w-64 bg-black text-white min-h-screen p-4">
      <img src={logo} onClick={()=> navigate('/user/home')} alt="Logo" className="mb-8 cursor-pointer" />

      <nav className="space-y-1">
        {[
          { icon: User, text: "Account Details", to: "/user/profile", active: true },
          { icon: History, text: "Order History", to: "/user/OrderHistory" },
          { icon: MapPin, text: "Track Order", to: "/track-order" },
          { icon: ShoppingCart, text: "Shopping Cart", to: "/user/cart" },
          { icon: Heart, text: "Wishlist", to: "/user/wishlist" },
          { icon: MapPin, text: "Address", to: "/user/address" },
          { icon: Wallet, text: "Wallet", to: "/user/wallet" },
          { icon: LogOut, text: "Log-out", action: handleLogout },
        ].map(({ icon: Icon, text,action, to, active }) => (
          <button
            key={text}
            onClick={action || (() => navigate(to))} 
            className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors w-full text-left
              ${active ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <Icon className="w-5 h-5" />
            {text}
          </button>
        ))}
      </nav>
    </div>
  );
}
