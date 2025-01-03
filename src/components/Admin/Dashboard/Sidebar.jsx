import { Link, useNavigate } from 'react-router-dom';
import { Home, Package, ListIcon as Category, FileText, Tag, Image, Receipt, Users, Settings, LogOut } from 'lucide-react';
import logo from '../../../assets/user/signup/logo 3.png';
import { logout } from '../../../redux/Slices/authSlice';
import { useDispatch } from 'react-redux';
export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'Products', icon: Package, path: '/admin/productdata' },
    { name: 'Category', icon: Category, path: '/admin/categorydata' },
    { name: 'Orders', icon: FileText, path: '/admin/orders' },
    { name: 'Coupon', icon: Tag, path: '/admin/coupon' },
    { name: 'Banner', icon: Image, path: '/admin/banner' },
    { name: 'Transaction', icon: Receipt, path: '/admin/transaction' },
    { name: 'Customers', icon: Users, path: '/admin/data' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = ()=>{
    dispatch(logout())
    navigate('/admin/login')
  }

  return (
    <div className="w-64 min-h-screen bg-black text-white p-4">
      <div className="mb-8">
        <img src={logo} alt="Logo" className="h-20" />
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}

        <Link onClick={handleLogout} to='/logout' className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 mt-auto">
          <LogOut className="h-5 w-5" />
          <span>Log-out</span>
        </Link>
      </nav>
    </div>
  );
}
