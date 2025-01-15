import Navbar from "../../../components/navbar/Navbar"
import Footer from "../../../components/Footer/Fotoer"
import ProductDetail from "../../../components/ProductDetail/ProductDetail"
function ProductDetailPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16"> {/* pt-16 accounts for the navbar height */}
        <ProductDetail />
      </main>
      <Footer />
    </div>
  )
}

export default ProductDetailPage