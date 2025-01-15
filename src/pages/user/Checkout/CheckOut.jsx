import Navbar from '../../../components/navbar/Navbar'
import Footer from '../../../components/Footer/Fotoer'
import PaymentMethods from '../../../components/CheckOut/PaymentMethods'
export default function CheckOut() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16"> {/* pt-16 accounts for the navbar height */}
        <PaymentMethods />
      </main>
      <Footer />
    </div>
  )
}
