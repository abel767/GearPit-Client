//images
import Ls2 from '../../assets/user/Helmets/Ls2.png'
import axor from '../../assets/user/Helmets/axor.png'
import scala from '../../assets/user/jackets/scala.png'
import { useNavigate } from 'react-router-dom';
function Featured() {
  const navigate = useNavigate()
    return (
      <section className="featured-products py-12 px-6">
        <h2 className="text-center text-3xl font-bold mb-8">Featured Products</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Product 1 */}
          <div className="product-card bg-white rounded-md  p-4">
            <img
              src={Ls2}
              alt="Product 1"
              className="w-full m-h-56 object-cover rounded-t-md "
            />
            <div className="p-4">
              <h3 className="font-bold text-lg">LS2 MX437 Fast Evo Roar</h3>
              <p className="text-gray-500 mt-2">₹15,400.00</p>
              <button className="mt-4 bg-black text-white py-2 px-4 rounded-md w-full hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-300 ease-in-out 
  bg-gradient-to-t hover:bg-gradient-to-b">
                Buy Now
              </button>
            </div>
          </div>
          {/* Product 2 */}
          <div className="product-card bg-white rounded-md  p-4">
            <img
              src={axor}
              alt="Product 2"
              className="w-full m-h-56 object-cover rounded-t-md"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg">Axor Hunter Solid Helmet</h3>
              <p className="text-gray-500 mt-2">₹10,900.00</p>
              <button className="mt-4 bg-black text-white py-2 px-4 rounded-md w-full hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-300 ease-in-out">
                Buy Now
              </button>
            </div>
          </div>
          {/* Product 3 */}
          <div className="product-card bg-white rounded-md  p-4">
            <img
              src={scala}
              alt="Product 3"
              className="w-full m-h-56 object-cover rounded-t-md"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg">Scala Brave Motorcycle Jacket</h3>
              <p className="text-gray-500 mt-2">₹21,200.00</p>
              <button className="mt-4  bg-black text-white py-2 px-4 rounded-md w-full hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-300 ease-in-out">
                Buy Now
              </button>
            </div>
          </div>
        </div>
        <button onClick={()=> navigate('/user/store')} className="block mt-6 mx-auto border-2 border-black bg-white hover:bg-black text-black hover:text-white py-3 px-6 rounded-md transition-all duration-300 ease-in-out font-anonymous-pro">
          See More →
        </button>
      </section>
    );
  }
  
  export default Featured;
  