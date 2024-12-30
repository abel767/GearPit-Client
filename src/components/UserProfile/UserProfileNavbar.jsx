import { Link } from "react-router-dom";


// Images
import logo from '../../assets/user/signup/logo 3.png';

const UserProfileNavbar = () => {
    return (
        <nav className="bg-black text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/user/home">
                <img src={logo} alt="GearPit Logo" className="h-20" />
            </Link>

            <div className="hidden md:flex space-x-6">
                <Link to="/" className="hover:text-gray-300">Home</Link>
                <Link to="/store" className="hover:text-gray-300">Store</Link>
                <Link to="/about" className="hover:text-gray-300">About Us</Link>
                <Link to="/contact" className="hover:text-gray-300">Contact Us</Link>
            </div>

           
        </nav>
    );
};

export default UserProfileNavbar;