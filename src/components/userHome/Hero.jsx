import image1 from '../../assets/user/Helmets/Ls2.png'
import image2 from '../../assets/user/Helmets/agv 46.png'

function Hero() {
    return (
        <section className="relative bg-gradient-to-t from-custom-red  to-black text-white min-h-[600px] overflow-hidden">
          {/* Main Content Container */}
          <div className="container mx-auto px-20 py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Text Content */}
              <div className="relative max-w-2xl">
                <span className="absolute -left-12 top-0 text-red-600 font-bold rotate-[-90deg] text-xl ">
                  BEST
                </span>
                <h1 className="text-[220px] font-bold leading-none tracking-tighter">
                  <span className=" text-Hero-title font-FontSpring  ">GEARPIT</span>
                  <span className="block text-6xl italic font-normal -mt-6 ml-24">Ride</span>
                </h1>
                <p className="text-xl mt-6 max-w-xl font-Roboto-font ">
                  Gear Up for the Ultimate Ride with Premium Biking Gear and 
                  Accessories from GearPit—Your Adventure Awaits!
                </p>
                <button className="mt-8 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-md flex items-center group transition-all">
                  Discover more
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </button>
              </div>
    
              {/* Helmet Images */}
              <div className="relative w-full max-w-2xl">
                <div className="flex justify-center items-center gap-4">
                  <img
                    src={image1}
                    alt="Just1 Helmet"
                    className="w-[400px] object-contain transform -rotate-12 animate-hover1"
                  />
                  <img
                    src={image2}
                    alt="AGV Helmet"
                    className="w-[400px] object-contain transform rotate-12 translate-y-8 animate-hover2"
                  />
                </div>
              </div>
            </div>
          </div>
    
          {/* Background Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black/50 to-black/80"
            style={{
              maskImage: 'radial-gradient(circle at center, black, transparent)',
              WebkitMaskImage: 'radial-gradient(circle at center, black, transparent)'
            }}
          />
        </section>
      )
    }
    
  
  export default Hero;
  