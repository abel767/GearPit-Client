import { Link, useNavigate } from 'react-router-dom';
import { Home, Package, ListIcon as Category, FileText, Tag, Image, Receipt, Users, Settings, LogOut } from 'lucide-react';
import logo from '../../../assets/Logo/logo.png';
import { adminLogout } from '../../../redux/Slices/adminSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios'
export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'Products', icon: Package, path: '/admin/productdata' },
    { name: 'Category', icon: Category, path: '/admin/categorydata' },
    { name: 'Inventory', icon: Package, path: '/admin/inventory' },
    { name: 'Orders', icon: FileText, path: '/admin/orders' },
    { name: 'Coupon', icon: Tag, path: '/admin/coupon' },
    { name: 'Banner', icon: Image, path: '/admin/banner' },
    { name: 'Transaction', icon: Receipt, path: '/admin/transaction' },
    { name: 'Customers', icon: Users, path: '/admin/data' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
        await axios.post('http://localhost:3000/admin/logout', {}, {
            withCredentials: true  // Important for cookie handling
        });
        dispatch(adminLogout());
        navigate('/admin/login');
    } catch (error) {
        console.error('Error during admin logout:', error);
    }
};

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
