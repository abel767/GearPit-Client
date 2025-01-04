import { BikeIcon as MotorcycleIcon } from 'lucide-react'
import { useNavigate } from "react-router-dom";
export default function NotFound() {
    const navigate = useNavigate()
  return (

    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-4xl w-full space-y-8 text-center relative">
        {/* Road */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gray-700 transform -skew-y-2"></div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gray-600 transform skew-y-2"></div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <div className="w-1/2 h-4  animate-pulse"></div>
        </div>

        {/* 404 Text with Motorcycle */}
        <div className="relative z-10">
          <h2 className="text-9xl font-extrabold text-white tracking-widest">
            4
            <span className="inline-block relative">
              <MotorcycleIcon className="h-32 w-32 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800">0</span>
            </span>
            4
          </h2>
        </div>

{/* Message */}
<div className="mt-8 z-10 relative">
  <h1 className="text-4xl font-bold text-white sm:text-5xl">Roadblock Ahead!</h1>
  <p className="mt-2 text-xl text-gray-300">Looks like you&apos;ve hit a detour on your digital ride.</p>
  <p className="mt-1 text-lg text-gray-400">The page you&apos;re looking for has either been moved or doesn&apos;t exist.</p>
</div>

        {/* CTA Button */}
        <div className="mt-10 relative z-10">
          <button onClick={()=> navigate('/user/home')} className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition duration-150 ease-in-out">
            <MotorcycleIcon className="h-6 w-6 mr-2" />
            Ride Back Home
          </button>
        </div>

        {/* Support Text */}
        <div className="mt-8 text-sm text-yellow-600 relative z-10">
          <p>Need a roadside assist? Contact our support team.</p>
        </div>

        {/* Animated Motorcycle */}
        <div className="absolute bottom-0 left-0 transform translate-y-1/2 animate-drive">
          <MotorcycleIcon className="h-16 w-16 text-red-500" />
        </div>
      </div>
    </div>
  )
}

