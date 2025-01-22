import Navbar from '../../../components/navbar/Navbar'
import Footer from '../../../components/Footer/Fotoer'
import PaymentSuccess from '../../../components/CheckOut/PaymentSuccess'
export default function PaymentDone() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16"> {/* pt-16 accounts for the navbar height */}
        <PaymentSuccess />
      </main>
      <Footer />
    </div>
  )
}
