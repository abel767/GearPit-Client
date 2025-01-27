import first from '../../assets/About/download.jpg'
import Logo from '../../assets/Logo/Logo2.png'
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Logo */}
      <header className="py-8">
        <h1 className="text-8xl font-black text-center tracking-tighter">GEARPIT</h1>
        <div className="flex justify-center gap-8 text-sm mt-1">
          <span>Instagram</span>
          <span>Facebook</span>
          <span>Reddit</span>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">WELCOME TO GEARPIT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <img
            src={first}
            alt="Vintage motorcycle"
            width={400}
            height={300}
            className="rounded-lg"
          />
          <div className="space-y-4">
            <p className="text-gray-600">
              At GearPit, we're passionate about celebrating your riding experience with high quality gear and
              accessories. Our mission is to provide riders with the best products that enhance style, safety, and
              performance.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section with Blur Effect */}
      <section className="relative py-32 my-20">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={Logo}
            alt="Background motorcycle"
            className="object-cover filter brightness-50"
          />
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-300 mb-4">Since</p>
            <p className="text-8xl font-bold text-yellow-50/90">2019</p>
          </div>
          <h2 className="text-7xl font-black text-white text-center tracking-wider">ABOUT US</h2>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-2">
              Our Mission and <span className="text-gray-400">Vision</span>
            </h3>
            <p className="text-gray-600 mt-4">
              To empower riders with high-quality gear that enhances their adventures, ensuring both style and safety.
              Vision: To be the leading provider of innovative and reliable motorcycle gear, setting new standards in
              the industry.
            </p>
          </div>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hPiyKlE86uSabDpndNxX5rVZ9bt1S3.png"
            alt="Rider with gear"
            width={500}
            height={400}
            className="rounded-lg"
          />
        </div>
      </section>

      {/* Community Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl mb-8">
          <span className="text-gray-400">Community</span> and Social Responsibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <img
              key={index}
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hPiyKlE86uSabDpndNxX5rVZ9bt1S3.png"
              alt={`Community image ${index}`}
              width={400}
              height={300}
              className="rounded-lg"
            />
          ))}
        </div>
        <p className="text-gray-600 mt-8">
          At GearPit, we're committed to giving back to the community. We actively participate in charity rides, promote
          safe riding, and share our love for motorcycles with safe riding practices. We believe in making a positive
          impact on one ride at a time.
        </p>
      </section>
    </div>
  )
}

