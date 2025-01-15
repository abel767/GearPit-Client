import Store from '../../../components/Store/Strore'
import Navbar from '../../../components/navbar/Navbar'
import Footer from '../../../components/Footer/Fotoer'

function StorePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16"> {/* pt-16 accounts for the navbar height */}
        <Store />
      </main>
      <Footer />
    </div>
  )
}

export default StorePage