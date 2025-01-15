import image1 from '../../assets/user/Helmets/hero.png'

function Hero() {
    return (
      <>
      
    
        <section className="relative bg-heroBlack text-white min-h-screen overflow-hidden">
          {/* Main Content Container */}
          <div className="container mx-auto px-4 md:px-6 py-16 relative">
            {/* Center Content Wrapper */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative">
              {/* BEST Text */}
              <span className="absolute left-20 top-25 text-red-600 font-bold text-sm tracking-wide">
                BEST
              </span>

              {/* Main Title Group - Lower z-index */}
              <div className="relative w-full text-center z-0">
                <h1 className="text-[clamp(8rem,25vw,16rem)] font-bold leading-none tracking-tighter text-[#f5f5f4] font-Roboto-font">
                  GEARPIT
                  <span className="block text-[clamp(2rem,5vw,3rem)] italic font-light text-red-600 absolute bottom-0 right-80 transform translate-y-1/2">
                    Ride
                  </span>
                </h1>
              </div>

              {/* Helmet Image - Higher z-index */}
              <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/3 w-[90%] max-w-xl z-10">
              <img
                src={image1}
                alt="Motorcycle Helmet"
                className="w-full h-auto object-contain mix-blend-lighten animate-hover1"
              />
              </div>

              {/* Bottom Left Content */}
              <div className="absolute bottom-0 left-0 max-w-xl">
                <p className="text-sm md:text-base font-light  text-zinc-400 tracking-wide font-anonymous-pro">
                  Gear Up for the Ultimate Ride with Premium Biking Gear and 
                  Accessories from GearPit—Your Adventure Awaits!
                </p>
                
                <button className="mt-8 border border-zinc-800 hover:bg-white/5 text-white px-6 py-2.5 rounded-sm flex items-center group transition-all text-sm">
                  Discover more
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
        </section>

        </>
    )
}

export default Hero

