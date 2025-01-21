import Navbar from '../../../components/navbar/Navbar'
import Footer from '../../../components/Footer/Fotoer'
import PaymentFailure from '../../../components/CheckOut/PaymentFailure'
export default function PaymentFailurePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16"> {/* pt-16 accounts for the navbar height */}
        <PaymentFailure />
      </main>
      <Footer />
    </div>
  )
}
