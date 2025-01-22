import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import image1 from '../../assets/user/Helmets/HeroHel.png';
import jacket from '../../assets/user/Jackets/bg/scala-min.png';
import boots from '../../assets/user/boots/bg/maverik_boots_3-removebg-preview.png';
import gloves from '../../assets/user/gloves/bg/kramster_k2k_3-removebg-preview.png';
import knee from '../../assets/user/Knee/bg removed/dup.png';
import { useNavigate } from 'react-router-dom';

function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  
  const images = [jacket, image1, boots, gloves, knee];
  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: MessageCircle, href: '#', label: 'WhatsApp' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleShopClick = () => {
    try {
      navigate('/user/store');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/user/store';
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-minWhite overflow-hidden">
      <div className="relative h-screen md:absolute md:right-20 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={`Slide ${currentImageIndex + 1}`}
            className="h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-black/30 md:hidden"></div>
        </AnimatePresence>

        <div className="absolute bottom-28 sm:bottom-32 md:bottom-4 right-4 flex flex-col space-y-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentImageIndex === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end md:justify-start md:top-1/4 md:left-12 z-10">
        {/* Social Links moved above text */}
        <div className="hidden md:flex gap-6 mb-8">
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              className="text-black hover:text-gray-700"
              aria-label={label}
            >
              <Icon size={24} />
            </motion.a>
          ))}
        </div>

        <div className="px-6 mb-4 text-white md:hidden">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm mb-8"
          >
            Elevate your ride with premium protection and style
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-sm mb-12"
          >
            Gear Up for the Ultimate Ride with Premium Biking Gear and Accessories from GearPit—Your Adventure Awaits!
          </motion.p>
        </div>

        <motion.div 
          className="px-6 pb-8 md:p-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-9xl font-bold tracking-tighter mb-4 text-white md:text-black">
            GEAR-
            <br />
            PIT
          </h1>
          <div className="flex items-center">
            <h2 className="text-xl font-medium text-white md:text-black">PREMIUM</h2>
            <h3 className="ml-2 text-xl font-medium text-white md:text-black">PROTECTION</h3>
            <p className="ml-2 text-sm text-white md:text-black">COLLECTION 2025</p>
            <motion.span
              className="ml-2 text-2xl text-white md:text-black"
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5 }}
            >
              →
            </motion.span>
          </div>
        </motion.div>
      </div>

      <div className="hidden md:block absolute bottom-8 right-8 max-w-sm">
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-600"
        >
          Experience the perfect fusion of style and safety with our curated collection of premium motorcycle gear. From DOT-certified helmets to abrasion-resistant jackets, we&aposve got everything you need for your next adventure.
        </motion.p>
      </div>

      <motion.button
        onClick={handleShopClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="hidden md:block absolute bottom-8 left-12 px-8 py-2 bg-white text-black border border-black transform transition-all duration-300 ease-in-out hover:bg-black hover:text-white hover:scale-105 active:scale-95"
      >
        SHOP
      </motion.button>

      <button 
        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
        className="hidden md:block absolute left-[25%] top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 p-2 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <button 
        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
        className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 p-2 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}

export default Hero;