import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ListIcon as Category, 
  FileText, 
  Tag, 
  Image, 
  Receipt, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { adminLogout } from '../../../redux/Slices/adminSlice';
import axiosInstance from '../../../api/axiosInstance';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'Sales Report', icon: Home, path: '/admin/salesreport' },
    { name: 'Products', icon: Package, path: '/admin/productdata' },
    { name: 'Category', icon: Category, path: '/admin/categorydata' },
    { name: 'Offer', icon: Tag, path: '/admin/offermanagement' },
    { name: 'Inventory', icon: Package, path: '/admin/inventory' },
    { name: 'Orders', icon: FileText, path: '/admin/orders' },
    { name: 'Coupons', icon: Tag, path: '/admin/coupons' },
    { name: 'Banner', icon: Image, path: '/admin/banner' },
    { name: 'Transaction', icon: Receipt, path: '/admin/transaction' },
    { name: 'Customers', icon: Users, path: '/admin/data' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/logout', {}, {
        withCredentials: true
      });
      dispatch(adminLogout());
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during admin logout:', error);
    }
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-40
        h-screen md:h-full bg-minBlack text-white
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isOpen ? 'w-64' : 'w-0 md:w-20'}
        overflow-hidden
        md:sticky
      `}>
        <div className="flex flex-col h-full min-h-screen p-4 w-64">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className={`transition-all duration-300 ${isOpen ? 'h-20' : 'h-12'}`}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleMenuClick}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                  ${location.pathname === item.path 
                    ? 'bg-gray-800 text-white' 
                    : 'hover:bg-gray-800/50 text-gray-300'}
                `}
              >
                <item.icon className={`
                  h-5 w-5 transition-colors duration-200 flex-shrink-0
                  ${location.pathname === item.path ? 'text-white' : 'text-gray-400'}
                `} />
                <span className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <Link
            onClick={handleLogout}
            to="/logout"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 text-gray-300 mt-4"
          >
            <LogOut className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              Log-out
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}