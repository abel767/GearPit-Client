import Navbar from '../../../components/navbar/Navbar'
import Footer from '../../../components/Footer/Fotoer'
import Wishlist from '../../../components/whishlist/Whislist'
export default function WhishlistPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16"> {/* pt-16 accounts for the navbar height */}
        <Wishlist />
      </main>
      <Footer />
    </div>
  )
}
