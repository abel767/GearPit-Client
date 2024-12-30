import {  User, History, MapPin, ShoppingCart, Heart, Wallet, LogOut } from 'lucide-react';
import logo from '../../assets/user/signup/logo 3.png'
export default function UserSidebar() {
  return (
    <div className="w-64 bg-black text-white min-h-screen p-4">
      <img src={logo} alt="Logo" className="mb-8" />
      
      <nav className="space-y-1">
        {[
        //   { icon: LayoutGrid, text: "Dashboard", active: true },
          { icon: User, text: "Account Details", active:true },
          { icon: History, text: "Order History" },
          { icon: MapPin, text: "Track order" },
          { icon: ShoppingCart, text: "Shopping cart" },
          { icon: Heart, text: "Wishlist" },
          { icon: MapPin, text: "Address" },
          { icon: Wallet, text: "Wallet" },
          { icon: LogOut, text: "Log-out" },
        ].map(({ icon: Icon, text, active }) => (
          <a
            key={text}
            href="#"
            className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors
              ${active ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <Icon className="w-5 h-5" />
            {text}
          </a>
        ))}
      </nav>
    </div>
  );
}
