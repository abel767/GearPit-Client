
import { Phone, MapPin, Mail, Facebook, Twitter, Instagram } from "lucide-react"
import Logo from '../../assets/Logo/Logo2.png'

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 md:py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-heroText">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-zinc-900 p-6 rounded-lg">
            <div className="mb-6">
              <p className="text-sm mb-1">IF YOU GOT ANY QUESTIONS</p>
              <p className="text-sm text-gray-400">PLEASE DO NOT HESITATE TO SEND US A MESSAGE</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                className="w-full p-3 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-white"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-white"
              />
              <input
                type="tel"
                placeholder="Phone number"
                className="w-full p-3 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-white"
              />
              <textarea
                placeholder="Your Message"
                rows="6"
                className="w-full p-3 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded transition duration-200"
              >
                Send
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl mb-4 text-gray-400">Get in touch with us</h2>
              <p className="text-sm text-gray-400">via phone, email, or connect with us on social media.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 rounded-full">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Call</h3>
                  <p className="text-gray-400">+91 9578442329</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 rounded-full">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Find</h3>
                  <p className="text-gray-400">vytila, Ernakulam, kerala</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 rounded-full">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Mail</h3>
                  <p className="text-gray-400">gearpit@gmail.com</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl mb-4 text-gray-400">Follow Our Ride</h2>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition duration-200">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition duration-200">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition duration-200">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="h-64 bg-zinc-900 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.326397220491!2d76.31796731479055!3d9.97235299283284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d514abfd541%3A0xbd582caa5844192!2sVyttila%2C%20Ernakulam%2C%20Kerala!5e0!3m2!1sen!2sin!4v1628151591240!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="mt-16 text-center">
          <img
            src={Logo}
            alt="GearPit Logo"
            width={200}
            height={100}
            className="mx-auto mb-4"
          />
          <p className="text-gray-400">GearPit Where Your Riding Adventure Begins</p>
        </div>
      </div>
    </div>
  )
}

