import  { useState } from 'react'
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react'

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('DETAILS')

  const images = [
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600',
    '/placeholder.svg?height=600&width=600',
  ]

  const relatedProducts = [
    {
      id: 1,
      name: 'Axor Helmet Racing Series',
      price: 7500.00,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 2,
      name: 'Axor Raider Solid Helmet',
      price: 8770.00,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 3,
      name: 'LS2 MX437 Fast Evo Roar',
      price: 8100.00,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 4,
      name: 'Scala Race motorcycle Jacket',
      price: 7999.00,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 5,
      name: 'Axor Spider Solid Helmet',
      price: 7770.00,
      image: '/placeholder.svg?height=200&width=200',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                className={`w-20 h-20 border-2 ${
                  selectedImage === index ? 'border-black' : 'border-gray-200'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image}
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="flex-1">
            <img
              src={images[selectedImage]}
              alt="Main product view"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl font-bold mb-2">
            LS2 MX437 Fast Evo Roar Off-Road Helmet
          </h1>
          <div className="flex items-center gap-1 mb-4">
            <div className="flex">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <Star className="w-4 h-4 fill-gray-200 text-gray-200" />
            </div>
            <span className="text-sm text-gray-500">(1,256 reviews)</span>
          </div>
          <p className="text-2xl font-bold mb-6">₹8,100.00</p>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Size</h3>
            <div className="flex gap-2">
              {['S', 'M', 'L'].map((size) => (
                <button
                  key={size}
                  className="w-10 h-10 border border-gray-300 hover:border-black flex items-center justify-center"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">QTY</h3>
            <div className="flex items-center gap-2">
              <button
                className="p-2 border border-gray-300 hover:bg-gray-100"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border border-gray-300 p-2"
              />
              <button
                className="p-2 border border-gray-300 hover:bg-gray-100"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button className="flex-1 bg-black text-white py-3 px-6 hover:bg-gray-800 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              ADD TO CART
            </button>
            <button className="flex-1 border border-black py-3 px-6 hover:bg-gray-100">
              BUY NOW
            </button>
          </div>

          <div className="border-t pt-8">
            <div className="flex gap-4 mb-4">
              <button
                className={`px-4 py-2 ${
                  activeTab === 'DETAILS'
                    ? 'border-b-2 border-black'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('DETAILS')}
              >
                DETAILS
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'REVIEWS'
                    ? 'border-b-2 border-black'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('REVIEWS')}
              >
                REVIEWS
              </button>
            </div>
            
            {activeTab === 'DETAILS' && (
              <div className="text-sm text-gray-600 space-y-4">
                <h3 className="font-bold text-black">LS2 MX437 Fast Evo Roar Off-Road / Motocross Helmet Features:</h3>
                <p>
                  If you are a Motocross or a Moto County or an Enduro racer and you do thrill rides you need serious
                  equipment and the FAST EVO MX437 delivers! The Fast Evo MX437 was developed for professional off-
                  road use in collaboration with our LS2 riders from the Cross, Enduro and Supermotard Championships
                  Series.
                </p>
                <p>
                  Made out of Kinetic Polymer Alloy (KPA) - innovative material is ultra-lightweight and offers a bit of energy
                  absorbing flexibi- lity to help with penetration resistance that rivals high-end composites.
                </p>
                <p>
                  Ventilation System: LS2 helmets feature a Dynamic Flow-through Ventilation. Fully adjustable intake ports
                  and venturi EPS work with the rear spoiler and exhaust ports to create a constant, light flow of air helping
                  to keep the rider cool and comfortable.
                </p>
              </div>
            )}
            
            {activeTab === 'REVIEWS' && (
              <div className="text-sm text-gray-600">
                <p>Customer reviews content would go here...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">RELATED PRODUCTS</h2>
          <button className="text-sm font-medium">SHOW MORE</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {relatedProducts.map((product) => (
            <div key={product.id} className="group">
              <div className="aspect-square mb-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-medium mb-1">{product.name}</h3>
              <p className="text-sm font-bold">₹{product.price.toFixed(2)}</p>
              <button className="w-full mt-2 bg-black text-white py-2 text-sm">
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

