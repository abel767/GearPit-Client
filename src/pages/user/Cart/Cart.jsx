import Navbar from '../../../components/navbar/Navbar'
import Footer from '../../../components/Footer/Fotoer'
import ShoppingCart from '../../../components/Cart/ShoppingCart'
export default function Cart() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16"> {/* pt-16 accounts for the navbar height */}
        <ShoppingCart />
      </main>
      <Footer />
    </div>
  )
}
