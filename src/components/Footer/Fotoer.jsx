
const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div>
          <h3 className="font-bold text-lg mb-4">GearPit</h3>
          <p className="text-sm text-gray-400">
            Welcome to GearPit, your ultimate destination for top-quality biking gear and accessories.
          </p>
        </div>

        {/* Middle Column */}
        <div>
          <h3 className="font-bold text-lg mb-4">Customer Service</h3>
          <ul className="text-sm space-y-2">
            <li>Contact Us</li>
            <li>FAQs</li>
            <li>Shipping & Returns</li>
            <li>Order Tracking</li>
          </ul>
        </div>

        {/* Right Column */}
        <div>
          <h3 className="font-bold text-lg mb-4">About Us</h3>
          <ul className="text-sm space-y-2">
            <li>Our Story</li>
            <li>Blog</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
