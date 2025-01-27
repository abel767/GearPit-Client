import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import HeroImage from "../../assets/user/Hero/HeroRe.png"
// import HeroImage2 from "../../assets/user/Hero/Hero.jpg"

function HeroSection() {
  const navigate = useNavigate()

  const handleShopClick = () => {
    try {
      navigate("/user/store")
    } catch (error) {
      console.error("Navigation error:", error)
      window.location.href = "/user/store"
    }
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background Text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-[12rem] md:text-[20rem] font-bold text-white/10 select-none tracking-wider  font-FontSpring">
          <span className="text-heroText">G</span>
          <span className="text-heroText">E</span>
          ARP
          <span className="text-heroText">I</span>
          <span className="text-heroText">T</span>
        </h1>
      </motion.div>

      {/* Foreground Image */}
      <motion.div
        className="absolute inset-0 flex items-end justify-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className="relative w-full h-full max-w-7xl">
          <img src={HeroImage || "/placeholder.svg"} alt="Motorcycle Gear" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Shop Button */}
      <motion.div
        className="absolute bottom-8 right-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={handleShopClick}
          className="group flex items-center gap-2 px-6 py-3 bg-black text-white border border-white/20 hover:bg-white hover:text-black transition-colors duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-sm tracking-widest">SHOP</span>
          <motion.span
            className="transform inline-block"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  )
}

export default HeroSection

