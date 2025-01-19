import logo from '../../assets/user/signup/logo 3.png';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <img src={logo} alt="GearPit Logo" className="h-10 w-auto" />
            <h1 className="font-bold text-lg">GearPit</h1>
            <p className="text-sm text-gray-400">
              Welcome to GearPit, your ultimate destination for top-quality biker gear and accessories. From helmets to gloves, jackets to gadgets, we have everything you need to ride in style and safety. Join our community of passionate riders and gear up for your next adventure with confidence!
            </p>
          </div>

          {/* Middle Column */}
          <div className="space-y-4">
            <h3 className="font-bold font-Roboto-font text-lg">Customer Service</h3>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-gray-300">Contact Us</a></li>
              <li><a href="#" className="hover:text-gray-300">FAQs</a></li>
              <li><a href="#" className="hover:text-gray-300">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-gray-300">Order Tracking</a></li>
            </ul>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">About Us</h3>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-gray-300">Our Story</a></li>
              <li><a href="#" className="hover:text-gray-300">Blog</a></li>
              <li><a href="#" className="hover:text-gray-300">Careers</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} GearPit. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

